import { NextRequest } from "next/server";
import cache from "../../../../../cache";
import BackBlazeClient from "@/app/backblaze/client";

export async function DELETE(req: NextRequest, { params }: { params: { key: string } }) {
    try {
        const key = params.key as string;
        console.log({ key });
        cache.delete(key);
        return new Response(JSON.stringify({ key, status: "success" }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } catch (e) {
        const error = e as Error;
        return new Response(JSON.stringify({ error: error.toString() }), {
            status: 400
        })
    }
}

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
    try {
        const name = params.name as string;
        const backBlazeClient = new BackBlazeClient();
        await backBlazeClient.authenticate();
        const csv = await backBlazeClient.downloadFile(name)

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                "Content-Disposition": `attachment; filename=${name}.csv`
            },
        });
    } catch (e) {
        const error = e as Error;
        console.log(error, params.name)
        return new Response(JSON.stringify({ error: error.toString() }), {
            status: 400
        })
    }
}