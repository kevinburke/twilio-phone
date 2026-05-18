import { Avatar } from "@twilio-paste/avatar"
import { Box } from "@twilio-paste/box"
import {
    ChatBubble, ChatLog, ChatMessage,
    ChatMessageMeta, ChatMessageMetaItem,
} from "@twilio-paste/chat-log"
import { SkeletonLoader } from "@twilio-paste/skeleton-loader"
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";


function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");

    return (
        messageList ?
            <Box overflowY="scroll" height="size40" tabIndex={0}>
                <ChatLog>
                    {messageList.length > 0 ?
                        messageList.map((message, i) => {
                            const isFromDevPhone = message.author === devPhoneName;
                            return (
                                <ChatMessage key={message.sid || i} variant={isFromDevPhone ? "outbound" : "inbound"}>
                                    <ChatBubble>
                                        {message.body}
                                    </ChatBubble>
                                    <ChatMessageMeta aria-label={isFromDevPhone ? "said by dev phone" : "said by inbound user"}>
                                        <ChatMessageMetaItem>
                                            <Avatar size="sizeIcon30" name={message.author} icon={UserIcon} />
                                            {message.author}
                                        </ChatMessageMetaItem>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        })
                        : <EmptyMessageList devPhoneNumber={numberInUse} />
                    }
                </ChatLog>
            </Box>
            : <SkeletonLoader height={"size20"} />
    )
}

export default MessageList
