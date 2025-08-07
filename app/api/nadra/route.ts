import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get("citizenId")

  if (!citizenId) {
    return NextResponse.json({ error: "Citizen ID is required" }, { status: 400 })
  }

  try {
    // Simulate NADRA API call (replace with actual NADRA API integration)
    // This is a mock response for development purposes
    const mockData = {
      citizen_id: citizenId,
      first_name: "John",
      last_name: "Doe",
      father_name: "Michael Doe",
      mother_name: "Sarah Doe",
      date_of_birth: "1990-01-01",
      nationality: "Pakistani",
      profession: "Engineer",
      pakistan_city: "Islamabad",
      pakistan_address: "House 123, Street 45, Islamabad",
      height: "5'8\"",
      color_of_eyes: "Brown",
      color_of_hair: "Black",
      departure_date: "2024-12-31",
      transport_mode: "Air",
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(mockData)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch NADRA data" },
      { status: 500 }
    )
  }
}
