

const ReactionPicker = ({ messageId }) => {
	const handleAddReaction = async (reaction) => {
		await fetch(`/api/messages/${messageId}/add-reaction`, {
			method: 'POST',
			body: JSON.stringify({ reaction }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	return (
		<div>
			<button onClick={() => handleAddReaction('👍')}>👍</button>
			<button onClick={() => handleAddReaction('❤️')}>❤️</button>
		</div>
	);
};

export default ReactionPicker
