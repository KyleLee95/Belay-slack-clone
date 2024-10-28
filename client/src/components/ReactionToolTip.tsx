import { useState, useEffect } from "react"


const ReactionTooltip = ({ messageId, reaction }) => {
	//const [users, setUsers] = useState([]);
	const users = [{ id: 1, name: "kyle", reaction: "👍" }, { id: 2, name: "john", reaction: "❤️" }]


	return (
		<div className="tooltip">
			{users.map(user => <div key={user.id}>
				{user.reaction}
				{user.name}
			</div>)}
		</div>
	);
};
export default ReactionTooltip
