import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth/auth.config"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filters = {
    status: searchParams.get("status"),
    search: searchParams.get("search"),
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
  }

  try {
    // Forward to existing backend API
    const response = await fetch(`${process.env.BACKEND_URL}/applications`, {
      headers: {
        Authorization: `Bearer ${(session.user as any).accessToken || ''}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch applications")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/applications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${(session.user as any).accessToken || ''}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to create application")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
}
