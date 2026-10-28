export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ask" && request.method === "POST") {
      try {
        const { message } = await request.json();

        if (typeof message !== "string" || !message.trim()) {
          return Response.json(
            { error: "Please enter a question." },
            { status: 400 }
          );
        }

        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "AI key is not configured." },
            { status: 500 }
          );
        }

        const aiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [
                { parts: [{ text: message.trim() }] }
              ]
            })
          }
        );

        const data = await aiResponse.json();

        if (!aiResponse.ok) {
          return Response.json(
            { error: "The AI service could not answer. Please try again." },
            { status: 502 }
          );
        }

        const answer =
          data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("") || "No answer received.";

        return Response.json({ answer });
      } catch {
        return Response.json(
          { error: "Something went wrong. Please try again." },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
