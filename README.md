# Quick start

**Note**

This project was completed as part of the course requirements for [MPCS](52553
Web Development)

After cloning the repo, run the following commands in your terminal:
`cd /path/to/belay_root_dir/server`

You should now be in the server directory. Run the following command to install the dependencies:
`pip3 install -r requirements.txt`

Now you should be able to run the server with the following command:
`flask run`

# Belay (a Slack clone)

## Features and Project Requirements

### Unauthenticated UI:

- Unauthenticated users can create a new account
- Unauthenticated users can sign in with their username and password
- Unauthenticated users who try to access a room cannot see any messages in that
  room, and are sent to the signup/login page instead

### Authenticated UI

- [x] Authenticated users can log out, change their username, and change their
      password

- [x] Authenticated users can see a list of all channels. For each channel, they
      can see how many unread messages they have in that channel

- [x] Visiting a channel marks all messages in it as read, and all new messages
      posted to that channel while the user is in it are marked as read too

- [x] Check for new messages in the channel at least once every 500 ms. Stop
      checking if the user leaves the channel. (Hint: use SetInterval)

- [x] Check for new unread messages in other channels at least once every second.
      Use only one HTTP request to get counts for all channels

- [x] For each message with replies, display the number of replies to that message
      just below the message content

- [x] All messages in a room have a Reply button or icon that opens the replies pane

- [] Parse image URLs that appear in messages and display the images at the end of
  the message. (Hint: you may use the web to help you find an appropriate
  regular expression)

- [x] Users can add an emoji reaction to any message or reply. You may choose a
      limited set of emoji reactions you support.

- [x] Hovering over a reaction displays all the users who had that reaction

### Single-Page State

- [x] Only serve one HTML request. Handle all other requests through the API
- Push the channel name (for messages) or parent message id (for replies) to the
  history and navigation bar when the user navigates to a channel or thread
  Users can use the Back button to navigate to a previous channel or thread

- [x] Loading the unique URL of a channel or thread should open the app to that
      channel or thread

- [x] If an unauthenticated user follows a link to a channel or thread, show them
      the login or signup screens, but if they log in or sign up, send them to the
      original page they requested

- [x] Save the user's auth key in localStorage or in a cookie. Include your CNETID
      as part of your storage keys so your storage won't conflict with those of
      other students on the graders' machines. e.g.
      `window.localStorage.setItem('trevoraustin_belay_auth_key', 'abcdefg')`

### Responsive Styling:

Wide Screen:

- [x] Show the list of channels down the left-hand side of the screen, and the
      channel the user is looking at (or a placeholder for no channel) on the
      right-hand side
- Clicking on the name of a channel loads that channel's messages into the
  right-hand column
- [x] The current channel is highlighted in the channel list, and the names of other
      channels change have a subtle visual change on hover
- [x] When viewing a reply thread, display the thread as a third column, narrowing
      the column with messages to fit it
- [x] Users can click an icon or button to dismiss the thread panel

Narrow Screens:

- [ ] On narrow screens, the page has a one-column layout with a menu bar. Users see
      the channel list, the messages in one channel, or the replies to one message
      at a time, and not the other two
- [x] When viewing replies, users can see the parent message they are replying to.
      They can click a button or link to navigate to the channel containing the
      parent message
- [x] When viewing messages in a channel on a narrow screen, users have a button or
      link they can click to navigate back to the channel list

### Database

- [x] Store channels, messages, and user account information in a SQLite3 database

- Create the database and its tables with migrations Start the name(s) of your
  migration file(s) with [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)
  timestamps so that the file system will list them in the order they were
  created. Check those migrations into version control for your assignment,
  alongside the actual database file

- [x] Create a table for channels that stores a unique id and the channel name

- [x] Create a table for messages that stores, at a minimum, what channel the
      message is in, the id of the user that wrote the message, and its text
      contents

- [x] Store Replies in the Messages table. Implement a way of distinguishing regular
      messages in a channel from replies to a message (e.g. with a `replies_to`
      column that is null for normal messages but contains a messsage_id for
      Replies)

- [x] Create a table for reactions that stores, at a minimum, the emoji, the id of
      the message or comment it is a reaction to, and the id of the user who made
      the reaction

- [x] Create a [join table](https://stackoverflow.com/questions/16549971/join-tables-in-sqlite-with-many-to-many)
      to capture the many-to-many relationship between Users and which Messages they
      have seen. (Hint: store the _latest_ timestamp or message id seen for each
      user in each channel—you don't have to store every user-to-message pair)

- Sanitize all database inputs by
  [passing them as arguments to a parameterized query](https://flask.palletsprojects.com/en/2.3.x/patterns/sqlite3/#:~:text=To%20pass%20variable%20parts%20to%20the%20SQL%20statement%2C%20use%20a%20question%20mark%20in%20the%20statement%20and%20pass%20in%20the%20arguments%20as%20a%20list.%20Never%20directly%20add%20them%20to%20the%20SQL%20statement%20with%20string%20formatting%20because%20this%20makes%20it%20possible%20to%20attack%20the%20application%20using%20SQL%20Injections)

### API

- Give API endpoints a unique path namespace to distinguish them from your HTML
  path(s) e.g. `/api/endpoint1`, `/api/encpoint2` etc
- Create an authentication endpoint that accepts a username and password, and
  returns a session token
- Authenticate to other endpoints via session token in the request header (not
  as a URL param or in a request body)
- Use GET requests for API calls that don't change data on the server, and POST
  requests for API calls that **do** change data on the server
- Create endpoints to create and get channels and messages, and to update a user's last
  read message in a channel
- Create an endpoint to return unread message counts for the user for each channel in a
  single request with a single database query

### Sources

- [Tailwind CSS](https://tailwindcss.com/)
- [ViteJS](https://vitejs.dev/)
- [React-Router](https://reactrouter.com/en/main)
- [Material UI](https://mui.com/)
- [ChatGPT for SQL queries](chat.openAI.com)
