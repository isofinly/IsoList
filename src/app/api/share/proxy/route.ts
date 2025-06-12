import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
        return NextResponse.json(
            { error: "fileId query parameter is required" },
            { status: 400 }
        );
    }

    const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
        const response = await fetch(googleDriveUrl, {
            method: 'GET',
            redirect: 'follow',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch from Google Drive: ${response.statusText}` },
                { status: response.status }
            );
        }

        // Check if the response is HTML (like a consent screen)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            // This might be a virus scan warning or a file that's too large for Google to scan.
            // We can't easily handle this on the server. We'll return an error indicating this.
            return NextResponse.json(
                { error: "Received an HTML response from Google Drive, which may be a confirmation page or an error. Manual download might be required." },
                { status: 400 }
            );
        }

        const data = await response.text();

        // Try to parse as JSON
        try {
            const jsonData = JSON.parse(data);
            return NextResponse.json(jsonData);
        } catch (parseError) {
            // If it's not valid JSON, return an error
            return NextResponse.json(
                { error: "Invalid JSON data received from Google Drive" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Internal Server Error during proxy request" },
            { status: 500 }
        );
    }
}
