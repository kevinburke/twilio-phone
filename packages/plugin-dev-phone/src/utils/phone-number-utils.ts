export function isVoiceUrlSet(voiceUrl: string) {
    // consider it "unset" if it is blank, or at the default value
    return voiceUrl && voiceUrl !== "" && voiceUrl !== 'https://demo.twilio.com/welcome/voice/';
}

export async function updateVoiceWebhook(selectedNumber: TwilioPhoneNumber, incomingPhoneNumbersApi: Function, properties: PhoneNumberProps) {
    if (!selectedNumber) return;

    console.log(`💻 Updating Voice webhook for ${selectedNumber.phoneNumber}...`);

    selectedNumber.voiceUrl = properties.voiceUrl;
    selectedNumber.statusCallback = properties.statusCallback;

    try {
        const updated = await incomingPhoneNumbersApi(selectedNumber.sid)
            .update({
                voiceUrl: properties.voiceUrl,
                statusCallback: properties.statusCallback,
            })
        console.log('✅ Voice webhook updated\n');
        return updated;
    } catch (err) {
        console.error(err)
    }
}

export async function removeVoiceWebhook(activeNumber: TwilioPhoneNumber, incomingPhoneNumbersApi: Function) {
    if (!activeNumber) return;

    console.log(`🚮 Removing incoming Voice webhook for ${activeNumber.phoneNumber}`);
    try {
        const updated = await incomingPhoneNumbersApi(activeNumber.sid)
            .update({
                voiceUrl: "",
                statusCallback: "",
            })
        return updated
    } catch (err) {
        console.error(err)
    }
}

interface PhoneNumberProps {
    voiceUrl: string,
    statusCallback: string
}

interface TwilioPhoneNumber extends PhoneNumberProps {
    phoneNumber: string,
    sid: string
}
