import ChannelItem from "./ChannelItem";
import { useEffect, useState } from "react";
const ChannelList = () => {
	const [channels, setChannels] = useState([]);



	return (
		<div className="mt-4">
			{channels.map((channel: any) => {
				return (
					<ChannelItem
						key={channel.id}
						channelId={channel.id}
						name={channel.name}
						unreadCount={3}
					/>
				);
			})}
		</div>
	);
};

export default ChannelList;
