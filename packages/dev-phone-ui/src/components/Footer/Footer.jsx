import { Anchor } from '@twilio-paste/anchor';
import { Box } from '@twilio-paste/box';
import { Flex } from '@twilio-paste/flex';
import { Paragraph } from '@twilio-paste/paragraph';
import { Text } from '@twilio-paste/text';
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';

function Footer() {
  return <Box marginTop={"space60"}>
    <Flex vertical hAlignContent={"center"}>
      <Box marginBottom={"space40"}>
        <LogoTwilioIcon decorative color="colorTextWeak" />
      </Box>
      <Paragraph marginBottom='space0'>
        <Text fontSize={"fontSize20"}>
          The Dev Phone is an open-source <Anchor href="https://www.twilio.com/labs">Twilio Labs Project</Anchor>.
        </Text>
      </Paragraph>
      <Paragraph>
        <Text fontSize={"fontSize20"}>
          For issues and contributions <Anchor href="https://github.com/twilio-labs/dev-phone" showExternal>check out our GitHub project</Anchor>. You can also <Anchor href="https://airtable.com/shrn1gZFT0uayIjgJ" showExternal>submit feedback via Airtable</Anchor>.
        </Text>
      </Paragraph>
    </Flex>
  </Box>
}

export default Footer;
