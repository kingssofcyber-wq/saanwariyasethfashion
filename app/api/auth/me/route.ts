import { NextResponse } from "next/server"; import { getSession,findSafeUser } from "@/lib/auth";
export async function GET(){const session=await getSession();if(!session)return NextResponse.json({user:null});const user=await findSafeUser(session.id);return NextResponse.json({user});}
