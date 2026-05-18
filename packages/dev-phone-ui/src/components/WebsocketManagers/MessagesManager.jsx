import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setMessages } from '../../actions'

const TwilioMessagesContext = React.createContext(null)
export { TwilioMessagesContext }

const TwilioMessagesManager = ({ children }) => {
    const messageDetails = useRef({})
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "")
    const destinationNumber = useSelector(state => state.destinationNumber)
    const dispatch = useDispatch()

    const refreshMessages = useCallback(async () => {
        if (!numberInUse) {
            return;
        }

        const params = new URLSearchParams({ phoneNumber: numberInUse });
        if (destinationNumber && destinationNumber.length > 6) {
            params.set('otherNumber', destinationNumber);
        }

        const response = await fetch(`/messages?${params.toString()}`);
        const data = await response.json();
        dispatch(setMessages(data.messages || []));
    }, [destinationNumber, dispatch, numberInUse]);

    const sendSms = async (from, to, body) => {
        if (from && to && body) {
          await fetch("/send-sms", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ from, to, body }),
          });
          await refreshMessages();
        } else {
          console.error("Not sending as some data is missing");
        }
    };

    useEffect(() => {
        refreshMessages().catch((error) => console.error(error));
        const interval = setInterval(() => {
            refreshMessages().catch((error) => console.error(error));
        }, 5000);
        return () => clearInterval(interval);
    }, [refreshMessages]);

    messageDetails.current = {
        refreshMessages,
        sendSms
    }

    return (
        <TwilioMessagesContext.Provider value={messageDetails.current}>
            {children}
        </TwilioMessagesContext.Provider>
    )

};

export default TwilioMessagesManager
