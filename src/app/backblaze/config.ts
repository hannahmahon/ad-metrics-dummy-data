const B2_API_URL = 'https://api.backblazeb2.com/b2api/v2/';

const getConfig = () => {
    return {
        apiUrl: B2_API_URL,
        accountId: process.env.BACKBLAZE_B2_ACCOUNT_ID || "",
        apiKey: process.env.BACKBLAZE_B2_API_KEY || "",
        bucketId: "9678605920fd7068971a0a1a",
        bucketName: "dummy-ad-campaign-csvs"
    }
}

export default getConfig();