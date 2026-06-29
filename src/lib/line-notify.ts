// src/lib/line-notify.ts
export async function sendLineNotify(message: string) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  
  if (!token) {
    console.error("❌ ไม่พบ LINE_NOTIFY_TOKEN ในระบบ");
    return { success: false, error: "Missing Token" };
  }

  try {
    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ message }),
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error };
  }
}