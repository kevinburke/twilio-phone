import { useEffect, useState, useCallback } from "react";
import { Box } from "@twilio-paste/box";
import { Button } from "@twilio-paste/button";
import { Card } from "@twilio-paste/card";
import { Heading } from "@twilio-paste/heading";
import { Paragraph } from "@twilio-paste/paragraph";
import { SkeletonLoader } from "@twilio-paste/skeleton-loader";
import { Stack } from "@twilio-paste/stack";
import { Text } from "@twilio-paste/text";
import { useSelector } from "react-redux";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

function SmsMessageRow({ message, numberInUse }) {
  const isOutbound = message.from === numberInUse;

  return (
    <Card>
      <Stack orientation="vertical" spacing="space30">
        <Box display="flex" justifyContent="space-between" columnGap="space60">
          <Text as="p" fontWeight="fontWeightSemibold">
            {isOutbound ? "Outgoing" : "Incoming"}
          </Text>
          <Text as="p" color="colorTextWeak">
            {formatDate(message.dateSent || message.dateCreated)}
          </Text>
        </Box>
        <Text as="p">
          <Text as="span" fontWeight="fontWeightSemibold">From:</Text> {message.from}
        </Text>
        <Text as="p">
          <Text as="span" fontWeight="fontWeightSemibold">To:</Text> {message.to}
        </Text>
        <Text as="p">{message.body}</Text>
        {message.status ? (
          <Text as="p" color="colorTextWeak">Status: {message.status}</Text>
        ) : ""}
      </Stack>
    </Card>
  );
}

function SmsMessagesPage() {
  const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);

  const refreshMessages = useCallback(async () => {
    if (!numberInUse) {
      setMessages([]);
      return;
    }

    const params = new URLSearchParams({
      phoneNumber: numberInUse,
      limit: "100",
    });
    const response = await fetch(`/api/messages?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || "Could not load messages");
    }

    setMessages(data.messages || []);
    setError(null);
  }, [numberInUse]);

  useEffect(() => {
    refreshMessages().catch(setError);
    const interval = setInterval(() => {
      refreshMessages().catch(setError);
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshMessages]);

  return (
    <Box
      maxWidth="900px"
      margin="auto"
      marginY="space120"
      padding="space120"
      backgroundColor="colorBackgroundBody"
      boxShadow="shadow"
      borderRadius="borderRadius20"
    >
      <Stack orientation="vertical" spacing="space70">
        <Box display="flex" justifyContent="space-between" columnGap="space60">
          <Box>
            <Heading as="h1" variant="heading20">SMS Messages</Heading>
            <Paragraph marginBottom="space0">
              Incoming and outgoing messages for {numberInUse || "the selected Twilio number"}.
            </Paragraph>
          </Box>
          <Button onClick={() => refreshMessages().catch(setError)} disabled={!numberInUse}>
            Refresh
          </Button>
        </Box>

        {error ? (
          <Text as="p" color="colorTextError">{error.message}</Text>
        ) : ""}

        {!numberInUse ? (
          <Text as="p">Select a Twilio number before viewing SMS messages.</Text>
        ) : messages === null ? (
          <SkeletonLoader height="size20" />
        ) : messages.length === 0 ? (
          <Text as="p">No SMS messages found.</Text>
        ) : (
          <Stack orientation="vertical" spacing="space40">
            {messages.map((message, index) => (
              <SmsMessageRow
                key={message.sid || index}
                message={message}
                numberInUse={numberInUse}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default SmsMessagesPage;
