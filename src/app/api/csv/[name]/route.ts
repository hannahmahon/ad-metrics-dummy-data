import { NextRequest } from "next/server";
import backBlazeClient from "@/app/backblaze/client";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
    try {
        const name = params.name as string;
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