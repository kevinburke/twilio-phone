import { useContext, useState, useMemo } from "react";
import { Box } from "@twilio-paste/box";
import { Button } from "@twilio-paste/button";
import { Column, Grid } from "@twilio-paste/grid";
import { Input } from "@twilio-paste/input";
import { Label } from "@twilio-paste/label";
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import { useSelector } from "react-redux";
import { TwilioMessagesContext } from '../WebsocketManagers/MessagesManager';
import MessageList from "./MessageList"

function SendSmsForm({ numberInUse }) {
  const [messageBody, setMessageBody] = useState('');

  const channelData = useSelector(state => state.channelData)
  const destinationNumber = useSelector(state => state.destinationNumber)

  const messagesClient = useContext(TwilioMessagesContext)
  const {sendSms} = messagesClient

  const canSendMessages = useMemo(() => {
    return destinationNumber && destinationNumber.length > 6;
  }, [destinationNumber]);

  // Handles the UI state for sending messages
  const sendIt = async (e) => {
    e.preventDefault()
    if (canSendMessages) {
      await sendSms(numberInUse, destinationNumber, messageBody);
      setMessageBody('')
    } else {
      console.error("Not sending as destination number is missing");
    }
  };

  return (
    <Box width="100%" backgroundColor={"colorBackgroundBody"}>
      <MessageList
        devPhoneName={channelData.devPhoneName}
      />
      <form onSubmit={(e) => sendIt(e)} method={"GET"}>
        <Label htmlFor="sendSmsBody" required>Message</Label>
        <Grid gutter={"space20"} marginBottom="space40">
          <Column span={10}>
            <Input id="sendSmsBody" type="text" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
          </Column>
          <Column span={2}>
            <Button type={"submit"} disabled={!canSendMessages}>
              <SendIcon decorative />
              Send
            </Button>
          </Column>
        </Grid>
      </form>
    </Box>

  );
}





export default SendSmsForm;
