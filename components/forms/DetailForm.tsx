"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { ArrowRightIcon } from "@/icons";
// import FormProgress from "./form-progress";
import Image from "next/image"


interface DetailFormProps {
  data: any;
  title: string | "Details";
  onNext: (data: any) => void;
  onBack: () => void;
  passportPhoto?: string | null; // Add passport photo prop
}


export function DetailForm({ data, title, onNext, onBack, passportPhoto }: DetailFormProps) {
    return(
<form
          className="bg-white rounded-2xl shadow-md px-12.5 py-5 w-[408px] h-[803px]"
        >
          <div className="flex justify-center border-b border-gray-100 w-full pb-2.5 px-4">
            <h3 className="text-2xl font-semibold">{title}</h3>
          </div>

        <div className="flex justify-between px-4 pt-4">
          <div className="flex flex-col justify-between gap-4">
            {/*1. FIRST NAME */}
            <div className="relative">
              <Label
                htmlFor="firstName"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                First name
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.first_name || "Not available"}
              </p>
              
            </div>

            {/*2. LAST NAME */}
            <div className="relative ">
              <Label
                htmlFor="lastName"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Last name
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.last_name || "Not available"}
              </p>
              
            </div>

            {/*3. FATHERS NAME */}
            <div className="relative">
              <Label
                htmlFor="fathersName"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Fathers Name
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.father_name || "Not available"}
              </p>
              
            </div>

            {/*4. MOTHERS NAME */}
            <div className="relative">
              <Label
                htmlFor="mothersName"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Mothers Name
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.mother_name || "Not available"}
              </p>
              
            </div>

            {/*5. GENDER */}
            <div className="relative">
              <Label
                htmlFor="gender"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Gender
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.gender || "Not available"}
              </p>
            
            </div>

            {/*6. PAK CITY */}
            <div className="relative">
              <Label
                htmlFor="pakistanCity"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Pakistan City
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.pakistan_city || "Not available"}
              </p>
              
            </div>

            {/*7. DOB */}
            <div className="relative">
              <Label
                htmlFor="dateOfBirth"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Date of Birth
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.date_of_birth || "Not available"}
              </p>
              
            </div>

            {/*8. BIRTH COUNTRY */}
            <div className="relative">
              <Label
                htmlFor="birthCountry"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Birth Country
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.birth_country || "Not available"}
              </p>
              
            </div>

            {/*9. BIRTH CITY */}
            <div className="relative">
              <Label
                htmlFor="placeOfBirth"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Birth City
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.birth_city || "Not available"}
              </p>
              
            </div>

            {/*10. PROFESSION */}
            <div className="relative">
              <Label
                htmlFor="maritalStatus"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Profession
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.profession || "Not available"}
              </p>
            
            </div>
            {/*11. PAK ADDRESS */}
            <div className="relative">
              <Label
                htmlFor="pakistanAddress"
                className="absolute left-3 top-3 text-xs text-gray-500"
              >
                Address
              </Label>
              <p className="mt-1 pt-6 pl-3 border-0 text-sm text-gray-800">
                {data?.pakistan_address || "Not available"}
              </p>
              
            </div>
          </div>
            <div className="mt-8">
             <Image
                          src={passportPhoto || "/avatar.png"}
                          alt="Citizen Photo"
                          width={120}
                          height={140}
                          className="object-cover rounded border border-gray-300"
                        />
             </div>
        </div>
        </form>
    );}