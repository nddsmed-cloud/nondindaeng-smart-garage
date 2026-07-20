import { NextResponse } from "next/server";
import { createVehicle } from "../../vehicles/vehicle-actions";

export async function GET() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  try {
    await createVehicle(formData);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error in vehicle creation API:", error);
    return NextResponse.json({ success: false, error: "Failed to create vehicle" }, { status: 500 });
  }
}
