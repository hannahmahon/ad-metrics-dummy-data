import { dayInMs } from "../utils";
import backBlazeConfig from "./config";

class BackBlazeClient {
    public apiUrl: string;
    public downloadUrl?: string;
    public uploadUrl?: string;

    public authorizationTokenExpiration: number = 0;
    public uploadAuthorizationTokenExpiration: number = 0;

    private privateApiUrl?: string;
    private accountId: string;
    private apiKey: string;
    private authorizationToken?: string;
    private uploadAuthorizationToken?: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || backBlazeConfig.apiUrl;
        this.accountId = backBlazeConfig.accountId;
        this.apiKey = backBlazeConfig.apiKey;

        if (!this.apiKey || !this.accountId) {
            throw new Error(`Missing key authentication information: apiKey or apiUrl`);
        }
    }

    public async authenticate() {
        if (new Date().getTime() < this.authorizationTokenExpiration) {
            console.log("skip authenticate call");
            return;
        } else {
            console.log("authenticating again ", new Date().getTime(), this.authorizationTokenExpiration)
        }
        const response = await fetch(`${this.apiUrl}b2_authorize_account`, {
            headers: {
                Authorization: 'Basic ' + Buffer.from(`${this.accountId}:${this.apiKey}`).toString('base64'),
            },
        });

        const data = await response.json();
        if (data.message) {
            console.log(data)
            throw new Error(data.message)
        }
        this.downloadUrl = data.downloadUrl;
        this.authorizationToken = data.authorizationToken;
        this.privateApiUrl = data.apiUrl;
        this.authorizationTokenExpiration = new Date().getTime() + dayInMs;
        console.log("set authorizationTokenExpiration", this.authorizationTokenExpiration)
    }

    public async loadUploadUrl(bucketId?: string) {
        if (!this.authorizationToken) {
            throw new Error(`User must first be authenticated to make this request with BackBlazeClient.authenticate`);
        }
        if (new Date().getTime() < this.uploadAuthorizationTokenExpiration) {
            console.log("skip upload url authenticate call");
            return;
        } else {
            console.log("upload url authenticating again ", new Date().getTime(), this.uploadAuthorizationTokenExpiration)
        }

        const bucket = bucketId || backBlazeConfig.bucketId;
        if (!this.authorizationToken) {
            throw new Error(`No valid bucketId found for request`);
        }
        const response = await fetch(`${this.privateApiUrl}/b2api/v2/b2_get_upload_url`, {
            method: 'POST',
            headers: {
                Authorization: this.authorizationToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bucketId: bucket }),
        });

        const data = await response.json();
        if (data.message) {
            console.log(data, bucket)
            throw new Error(data.message)
        }
        this.uploadUrl = data.uploadUrl;
        this.uploadAuthorizationToken = data.authorizationToken;
        this.uploadAuthorizationTokenExpiration = new Date().getTime() + dayInMs;
        console.log("set uploadAuthorizationTokenExpiration", this.uploadAuthorizationTokenExpiration)
    };

    public async getFileId(fileName: string, bucketName?: string) {
        if (!this.authorizationToken) {
            throw new Error(`User must first be authenticated to make this request with BackBlazeClient.authenticate`);
        }

        const response = await fetch(`${this.privateApiUrl}/b2api/v2/b2_list_file_names`, {
            method: 'POST',
            headers: {
                Authorization: this.authorizationToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bucketId: bucketName || backBlazeConfig.bucketId,
                startFileName: fileName,
                maxFileCount: 1,
            }),
        });

        const data = await response.json();
        if (data.message) {
            console.log(data)
            throw new Error(data.message)
        }
        if (data.files && data.files.length > 0) {
            return data.files[0].fileId;
        } else {
            throw new Error(`File "${fileName}" not found`);
        }
    }

    public async uploadFile(fileName: string, fileContent: string) {
        if (!this.uploadUrl || !this.uploadAuthorizationToken) {
            throw new Error(`User must first load the upload url with BackBlazeClient.loadUploadUrl`);
        }
        const response = await fetch(this.uploadUrl, {
            method: 'POST',
            headers: {
                Authorization: this.uploadAuthorizationToken,
                'X-Bz-File-Name': encodeURIComponent(fileName),
                'Content-Type': 'text/csv',
                'X-Bz-Content-Sha1': 'do_not_verify', // or compute the SHA1 hash of the file
            },
            body: fileContent,
        });

        const data = await response.json();
        if (data.message) {
            console.log(data)
            throw new Error(data.message)
        }
        return data;
    };

    public async downloadFile(fileName: string, bucketName?: string) {
        if (!this.downloadUrl || !this.authorizationToken) {
            throw new Error(`User must first load the download url with BackBlazeClient.authenticate`);
        }
        const response = await fetch(`${this.downloadUrl}/file/${bucketName || backBlazeConfig.bucketName}/${encodeURIComponent(fileName)}`, {
            headers: {
                Authorization: this.authorizationToken,
            },
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }

        const fileContent = await response.text();
        return fileContent;
    };

    public async deleteFile(fileName: string, fileId: string) {
        if (!this.authorizationToken) {
            throw new Error(`User must first be authenticated to make this request with BackBlazeClient.authenticate`);
        }
        const response = await fetch(`${this.privateApiUrl}/b2api/v2/b2_delete_file_version`, {
            method: 'POST',
            headers: {
                Authorization: this.authorizationToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: fileName,
                fileId: fileId,
            }),
        });

        const data = await response.json();
        if (data.message) {
            console.log(data)
            throw new Error(data.message)
        }
        return data;
    };

}

const backBlazeClient = new BackBlazeClient();
export default backBlazeClient;