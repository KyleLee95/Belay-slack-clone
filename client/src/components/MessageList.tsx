import Message from "./Message"



const MessageList = ({ messages, isThread }) => {

	return (
		<div className="flex-grow overflow-y-scroll p-4">
			{messages.map(message => (
				<Message key={message.id} isThread={isThread} u ser={message.user} message={message} />
			))}
		</div>
	);
};

export default MessageList
