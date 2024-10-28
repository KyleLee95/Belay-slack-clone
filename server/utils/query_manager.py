class Model:
    _relationships = {}
    _conn = None

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    @classmethod
    def create(cls, **kwargs):
        instance = cls(**kwargs)
        # here you could add logic to save to a database
        return instance

    def addRelation(self, relation, instance):
        relation_name = self._relationships[self.__class__][relation]["type"]
        if relation_name == "hasMany" or relation_name == "belongsToMany":
            if relation not in self.__dict__:
                self.__dict__[relation] = []
            self.__dict__[relation].append(instance)
        else:
            self.__dict__[relation] = instance

    @classmethod
    def set_connection(cls, conn):
        cls._conn = conn

    @classmethod
    def all(cls):
        table = cls.__name__.lower() + "s"
        cur = cls._conn.cursor()
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        return [
            cls(**dict(zip([column[0] for column in cur.description], row)))
            for row in rows
        ]

    @classmethod
    def where(cls, **kwargs):
        table = cls.__name__.lower() + "s"
        conditions = " AND ".join([f"{k} = ?" for k in kwargs.keys()])
        values = tuple(kwargs.values())
        cur = cls._conn.cursor()
        cur.execute(f"SELECT * FROM {table} WHERE {conditions}", values)
        rows = cur.fetchall()
        return [
            cls(**dict(zip([column[0] for column in cur.description], row)))
            for row in rows
        ]

    @classmethod
    def belongsTo(cls, other_cls, as_relation):
        if cls not in Model._relationships:
            Model._relationships[cls] = {}
        Model._relationships[cls][as_relation] = {
            "type": "belongsTo",
            "target": other_cls,
        }

    @classmethod
    def hasOne(cls, other_cls, as_relation):
        if cls not in Model._relationships:
            Model._relationships[cls] = {}
        Model._relationships[cls][as_relation] = {
            "type": "hasOne", "target": other_cls}

    @classmethod
    def hasMany(cls, other_cls, as_relation):
        if cls not in Model._relationships:
            Model._relationships[cls] = {}
        Model._relationships[cls][as_relation] = {
            "type": "hasMany",
            "target": other_cls,
        }

    @classmethod
    def belongsToMany(cls, other_cls, as_relation):
        if cls not in Model._relationships:
            Model._relationships[cls] = {}
        Model._relationships[cls][as_relation] = {
            "type": "belongsToMany",
            "target": other_cls,
        }

    def save(self):
        columns = ", ".join(self.__dict__.keys())
        placeholders = ", ".join(["?" for _ in self.__dict__])
        values = tuple(self.__dict__.values())
        # assuming table name is classname + 's'
        table = self.__class__.__name__.lower() + "s"

        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        cur = self._conn.cursor()
        cur.execute(query, values)
        self._conn.commit()
        return cur.lastrowid

    @classmethod
    def raw(cls, sql, params=None):
        cur = cls._conn.cursor()
        if params:
            cur.execute(sql, params)
        else:
            cur.execute(sql)
        columns = [column[0] for column in cur.description]
        result = [dict(zip(columns, row)) for row in cur.fetchall()]
        return result

    def related(self, related_cls_name):
        relationship = self._relationships.get(related_cls_name)
        if relationship and relationship["type"] == "hasMany":
            related_cls = relationship["class"]
            foreign_key = relationship["foreign_key"]
            return related_cls.where(**{foreign_key: self.id})
        raise ValueError("Relationship not defined or incorrect")

    def __repr__(self):
        return f"{self.__class__.__name__}({self.__dict__})"
