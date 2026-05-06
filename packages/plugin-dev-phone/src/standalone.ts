#!/usr/bin/env node

const DevPhoneServer = require('./commands/dev-phone');
const { version } = require('../package.json');

type ParsedArgs = {
    flags: Record<string, any>;
    credentials: {
        accountSid: string;
        authToken?: string;
        apiKey?: string;
        apiSecret?: string;
    };
}

const usage = () => `Dev Phone standalone server

Usage:
  envdir env npm run dev-phone -- --headless
  dev-phone --account-sid AC... --auth-token ... [options]

Credentials are read from TWILIO_ACCOUNT_SID plus either
TWILIO_AUTH_TOKEN or TWILIO_API_KEY and TWILIO_API_SECRET.
The matching credential flags are also supported for explicit overrides.

Options:
  --phone-number <value>  Associate the Dev Phone with this Twilio number.
  --force                 Overwrite existing phone-number webhook config.
  --headless              Print the local UI URL instead of opening a browser.
  --clear                 Remove existing dev-phone resources before starting.
  --port <value>          Local server port.
  --version               Print the package version.
  --help                  Print this help text.
`;

function readValue(argv: string[], index: number, name: string): string {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${name}`);
    }
    return value;
}

function parseArgs(argv: string[]): ParsedArgs {
    const flags: Record<string, any> = {
        headless: false,
        clear: false,
        force: false,
    };
    const credentials = {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN,
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case '--account-sid':
                credentials.accountSid = readValue(argv, i, arg);
                i++;
                break;
            case '--auth-token':
                credentials.authToken = readValue(argv, i, arg);
                i++;
                break;
            case '--api-key':
                credentials.apiKey = readValue(argv, i, arg);
                i++;
                break;
            case '--api-secret':
                credentials.apiSecret = readValue(argv, i, arg);
                i++;
                break;
            case '--phone-number':
                flags['phone-number'] = readValue(argv, i, arg);
                i++;
                break;
            case '--port':
                flags.port = readValue(argv, i, arg);
                i++;
                break;
            case '--force':
            case '-f':
                flags.force = true;
                break;
            case '--headless':
                flags.headless = true;
                break;
            case '--clear':
                flags.clear = true;
                break;
            case '--help':
                console.log(usage());
                process.exit(0);
                break;
            case '--version':
                console.log(version);
                process.exit(0);
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (!credentials.accountSid) {
        throw new Error('Provide --account-sid or set TWILIO_ACCOUNT_SID');
    }
    if (!credentials.authToken && (!credentials.apiKey || !credentials.apiSecret)) {
        throw new Error('Provide --auth-token or both --api-key and --api-secret');
    }

    return { flags, credentials };
}

async function main() {
    const { flags, credentials } = parseArgs(process.argv.slice(2));
    await DevPhoneServer.runStandalone(flags, credentials);
}

main().catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
});
