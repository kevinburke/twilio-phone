import { useState, useEffect } from "react";

import { Alert } from "@twilio-paste/alert";
import { Anchor } from "@twilio-paste/anchor";
import { Box } from "@twilio-paste/box";
import { Button } from "@twilio-paste/button";
import { Card } from "@twilio-paste/card";
import { Heading } from "@twilio-paste/heading";
import { Label } from "@twilio-paste/label";
import { Paragraph } from "@twilio-paste/paragraph";
import { Option, Select } from "@twilio-paste/select";
import { SkeletonLoader } from "@twilio-paste/skeleton-loader";
import { Stack } from "@twilio-paste/stack";
import { Text } from "@twilio-paste/text";
import { useSelector } from "react-redux";
import WelcomeDialog from "./WelcomeDialog";

const hasExistingVoiceConfig = (pn) => {
  return (
    pn.voiceUrl && pn.voiceUrl !== "https://demo.twilio.com/welcome/voice/"
  );
};

const getSelectLabelForPn = (pn, inboundCalling) => {
  const warning = inboundCalling && hasExistingVoiceConfig(pn) ? "⚠️ " : "";
  return `${warning}${pn.phoneNumber} [${pn.friendlyName}]`;
};

const getPnDetailsByNumber = (pn, allPns) => {
  return allPns.filter((thisPn) => thisPn.phoneNumber === pn)[0];
};

const sortUnconfiguredNumbersFirstThenAlphabetically = (pn1, pn2) => {
  if (hasExistingVoiceConfig(pn1) && !hasExistingVoiceConfig(pn2)) return 1;
  if (hasExistingVoiceConfig(pn2) && !hasExistingVoiceConfig(pn1)) return -1;
  return pn1.phoneNumber.localeCompare(pn2.phoneNumber);
};

const numPicker = async (currentNum, selectNum, getAvailableNums) => {
  if (!currentNum) {
    try {
      const response = await fetch('/phone-numbers')
      const data = await response.json()
      data["phone-numbers"].sort(
        sortUnconfiguredNumbersFirstThenAlphabetically
      )
      getAvailableNums(data["phone-numbers"]);
      if (data["phone-numbers"].length !== 0) {
        selectNum(
          getPnDetailsByNumber(
            data["phone-numbers"][0].phoneNumber,
            data["phone-numbers"]
          )
        );
      }
    } catch (error) {
      console.error(error)
    }
  }
}


function PhoneNumberPickerContainer({ children }) {
  return <Box
    maxWidth={"75%"}
    margin={"auto"}
    marginY={"space120"}
    padding={"space120"}
    backgroundColor={"colorBackgroundBody"}
    boxShadow={"shadow"}
    borderRadius={"borderRadius20"}
  >
    {children}
  </Box>
}


function PhoneNumberPicker({ configureNumberInUse, phoneNumbers }) {
  const [twilioPns, setTwilioPns] = useState(null);
  const [selectedPn, setSelectedPn] = useState(null);
  const inboundCalling = useSelector(state => !!state.channelData.inboundCalling);

  useEffect(() => {
    numPicker(selectedPn, setSelectedPn, setTwilioPns);
  }, [selectedPn]);

  if (twilioPns === null) {
    return (<SkeletonLoader height={"size50"} />)
  } else if (twilioPns.length === 0) {
    return (
      <PhoneNumberPickerContainer>
        <WelcomeDialog />
        <Stack orientation={"vertical"}>
          <Box width="200px" as="img" src="https://paste.twilio.design/images/patterns/empty-no-results-found.png" alt="" />
          <Heading as="h2" variant="heading20">Could not find any phone numbers.</Heading>
          <Paragraph>In order to use the Dev Phone you'll need to have a Twilio Phone Number. Once you purchased a phone number you can refresh this page to get started.</Paragraph>
          <Button
            as="a"
            href="https://support.twilio.com/hc/en-us/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console"
            target="_blank"
          >Purchase a phone number to get started.</Button>
        </Stack>
      </PhoneNumberPickerContainer>
    )
  } else {
    return (
      <PhoneNumberPickerContainer>
        <WelcomeDialog />
        <Stack orientation="vertical">
          <Heading as="h2" variant="heading20">Select a phone number</Heading>
          <Paragraph>
            Pick one of the phone numbers from your Twilio account to configure your Dev Phone. This phone number will be the one to send messages and make calls.
            SMS messages sent to this number will show up in the Dev Phone. Inbound calls require starting the server with inbound calling enabled.
          </Paragraph>
          <Label htmlFor="devPhonePn" required>
            Phone number
          </Label>
          <Select
            id="devPhonePn"
            onChange={(e) =>
              setSelectedPn(getPnDetailsByNumber(e.target.value, twilioPns))
            }
          >
            {twilioPns.map((pn) => (
              <Option key={pn.phoneNumber} value={pn.phoneNumber}>
                {getSelectLabelForPn(pn, inboundCalling)}
              </Option>
            ))}
          </Select>
        </Stack>

        {selectedPn ? (
          <Stack orientation="vertical" spacing="space60">
            {inboundCalling && hasExistingVoiceConfig(selectedPn) ? (
              <Stack orientation="vertical" spacing="space30">
                <Alert variant="warning">
                  Inbound calling is enabled. This phone number has existing voice config which will be overwritten.
                </Alert>
                <Text>Configured Voice URL: <em>{selectedPn.voiceUrl}</em></Text>
              </Stack>
            ) : (
              ""
            )}

            <Button variant="primary" onClick={(e) => configureNumberInUse(selectedPn)}>
              Use this phone number
            </Button>
          </Stack>
        ) : (
          ""
        )}
      </PhoneNumberPickerContainer>
    );
  }
}

export default PhoneNumberPicker;
