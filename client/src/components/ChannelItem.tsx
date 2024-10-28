import { NavLink } from 'react-router-dom';

const ChannelItem = ({ channelId, name, unreadCount }) => {
	return (
		<NavLink
			className="flex justify-center rounded px-4 py-2 my-2 hover:bg-gray-700 cursor-pointer"
			style={({ isActive, isPending, isTransitioning }) => {
				return {
					fontWeight: isActive ? "bold" : "",
					backgroundColor: isActive ? "gray" : "",
					color: isPending ? "gray" : "white",
					viewTransitionName: isTransitioning ? "slide" : "",
				};
			}}
			to={`/client/${channelId}`}>
			#{name} {unreadCount}

		</NavLink>
	);
};



export default ChannelItem;
