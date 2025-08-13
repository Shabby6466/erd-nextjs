"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { Application } from "@/lib/types";
import { applicationAPI } from "@/lib/api/applications";
import { showNotification } from "@/lib/utils/notifications";
import { formatDate } from "@/lib/utils/formatting";

type Params = { id: string };

type IniTextProps = {
  x: number;
  y: number;
  text: string;
  size?: number;
  bold?: boolean;
  mrz?: boolean;
};

export default function PrintApplicationPage() {
  const params = useParams<Params>();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingPrinted, setIsMarkingPrinted] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        // Use the new dedicated ready-for-print endpoint
        const data = await applicationAPI.getReadyForPrintById(params.id);
        setApplication(data);
      } catch (error) {
        console.error('Failed to fetch ready-for-print application:', error);
        // Fallback to regular endpoint if ready-for-print endpoint fails
        try {
          const data = await applicationAPI.getById(params.id);
          setApplication(data);
        } catch (fallbackError) {
          showNotification.error("Failed to fetch application details");
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (params?.id) fetchApplication();
  }, [params?.id]);

  const markAsPrinted = async () => {
    if (!application || application.isPrinted) return;
    
    setIsMarkingPrinted(true);
    try {
      await applicationAPI.markAsPrinted(application.id);
      setApplication(prev => prev ? { ...prev, isPrinted: true, printedAt: new Date().toISOString() } : null);
      showNotification.success("Application marked as printed successfully");
    } catch (error) {
      console.error('Failed to mark as printed:', error);
      showNotification.error("Failed to mark application as printed");
    } finally {
      setIsMarkingPrinted(false);
    }
  };

  useEffect(() => {
    if (application) {
      // Ensure the DOM paints before opening the print dialog
      setTimeout(() => {
        window.print();
        // Mark as printed after a short delay to ensure print dialog has opened
        setTimeout(() => {
          if (!application.isPrinted) {
            markAsPrinted();
          }
        }, 1000);
      }, 0);
    }
  }, [application]);

  const fields = useMemo(() => {
    if (!application) return null;

    const type = "P"; // PASSPORT
    const nationalityCode = "PAK";
    const nationalityText = "PAKISTANI";

    const docno = application.id ?? ""; // Document/Passport No
    const surName = application.lastName ?? "";
    const givenNames = application.firstName ?? "";

    const dob = application.dateOfBirth ? formatDate(application.dateOfBirth) : "";
    const sex =
      application.gender === "MALE" ? "M" : application.gender === "FEMALE" ? "F" : "";

    const validFrom = application.updatedAt ? formatDate(application.updatedAt) : "";
    const validUntil = application.departureDate ? formatDate(application.departureDate) : "";

    const citizenno = application.citizenId ?? "";
    const trackingno = application.id ?? "";
    const issuingauthority = "PAKISTAN";

    const ocr1 = generateMRZLine1({ surName, givenNames });
    const ocr2 = generateMRZLine2({
      documentNo: docno,
      nationality: nationalityCode,
      birthDate: application.dateOfBirth ?? null,
      gender: sex,
      expiryDate: application.departureDate ?? null,
      personalNumber: citizenno,
    });

    return {
      type,
      nationalityCode,
      nationalityText,
      docno,
      surName,
      givenNames,
      dob,
      sex,
      validFrom,
      validUntil,
      citizenno,
      trackingno,
      issuingauthority,
      ocr1,
      ocr2,
      photoDataUrl: application.image ? `data:image/jpeg;base64,${application.image}` : null,
    };
  }, [application]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!fields) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      <div className="sheet" aria-label="Print sheet 263x369mm">
        {/* Three equal horizontal panels (123mm each) */}
        <div className="panel" />
        <div className="panel" />
        <div className="panel" />

        {/* Header band */}
        <div
          className="header-band"
          style={{ left: mm(0), top: mm(0), width: mm(263), height: mm(15) }}
        >
          <div className="header-text">
            <h1>ISLAMIC REPUBLIC OF</h1>
            <h2>PAKISTAN</h2>
            <h3>PASSPORT</h3>
          </div>
        </div>

        {/* Photo: item24 = 48,202,appPic,30,38.4 */}
        {fields.photoDataUrl ? (
          <img
            src={fields.photoDataUrl}
            alt="Applicant"
            style={{
              position: "absolute",
              left: mm(48),
              top: mm(202),
              width: mm(30),
              height: mm(38.4),
              objectFit: "cover",
              border: "0.2mm solid #999",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: mm(48),
              top: mm(202),
              width: mm(30),
              height: mm(38.4),
              border: "0.2mm solid #999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8pt",
              color: "#666",
            }}
          >
            PHOTO
          </div>
        )}

        {/* Labels & values (mirroring INI coordinates) */}
        <IniText x={87} y={190} text="Type" bold size={5} />
        <IniText x={89} y={192.5} text={fields.type} size={8} />

        <IniText x={98} y={190} text="Country Code" bold size={5} />
        <IniText x={100} y={192.5} text={fields.nationalityCode} size={8} />

        <IniText x={119} y={190} text="Document No" bold size={5} />
        <IniText x={121} y={192.5} text={fields.docno} size={8} />

        <IniText x={87} y={196.5} text="Surname" bold size={5} />
        <IniText x={89} y={198.5} text={fields.surName} size={8} />

        <IniText x={87} y={202.5} text="Given Names" bold size={5} />
        <IniText x={89} y={204.5} text={fields.givenNames} size={8} />

        <IniText x={87} y={208.5} text="Nationality" bold size={5} />
        <IniText x={89} y={210.5} text={fields.nationalityText} size={8} />

        <IniText x={87} y={214.5} text="Date of birth" bold size={5} />
        <IniText x={89} y={216.5} text={fields.dob} size={8} />

        <IniText x={87} y={220.5} text="Sex" bold size={5} />
        <IniText x={89} y={222.5} text={fields.sex} size={8} />

        <IniText x={87} y={226.5} text="Date of Issue" bold size={5} />
        <IniText x={89} y={228.5} text={fields.validFrom} size={8} />

        <IniText x={87} y={232.5} text="Date of Expiry" bold size={5} />
        <IniText x={89} y={234.5} text={fields.validUntil} size={8} />

        <IniText x={119} y={220.5} text="Citizen Number" bold size={5} />
        <IniText x={121} y={222.5} text={fields.citizenno} size={8} />

        <IniText x={119} y={226.5} text="Issuing Authority" bold size={5} />
        <IniText x={121} y={228.5} text={fields.issuingauthority} size={8} />

        <IniText x={119} y={232.5} text="Tracking Number" bold size={5} />
        <IniText x={121} y={234.5} text={fields.trackingno} size={8} />

        {/* MRZ lines */}
        <IniText x={48} y={246} text={fields.ocr1} size={10.49} mrz />
        <IniText x={48} y={252} text={fields.ocr2} size={10.49} mrz />
      </div>

      <style jsx>{`
        .print-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          padding: 16px;
        }
        .sheet {
          position: relative;
          width: 263mm;
          height: 369mm; /* 3 x 123mm */
          background: #fff;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .panel {
          position: absolute;
          left: 0;
          width: 263mm;
          height: 123mm;
          border-bottom: 0.2mm solid #ddd;
        }
        .panel:nth-child(1) {
          top: 0mm;
        }
        .panel:nth-child(2) {
          top: 123mm;
        }
        .panel:nth-child(3) {
          top: 246mm;
          border-bottom: none;
        }

        .header-band {
          position: absolute;
          background: #006600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-text {
          color: #fff;
          text-align: center;
        }
        .header-text h1 {
          font-size: 8pt;
          margin: 0;
          line-height: 1.1;
          font-weight: 400;
        }
        .header-text h2 {
          font-size: 12pt;
          margin: 0;
          line-height: 1.1;
          font-weight: 700;
        }
        .header-text h3 {
          font-size: 10pt;
          margin: 0;
          line-height: 1.1;
          font-weight: 500;
        }

        @font-face {
          font-family: "OCRBWeb";
          src: local("OCR B"), local("OCR-B"), local("OCR-B 10 BT");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .mrz {
          font-family: "OCRBWeb", "OCR B", "OCR-B 10 BT", monospace;
          letter-spacing: 0.6pt;
        }

        @media print {
          .print-container {
            background: #fff;
            padding: 0;
          }
          .sheet {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

/** mm -> CSS mm string */
function mm(n: number): string {
  return `${n}mm`;
}

function IniText({ x, y, text, size = 8, bold = false, mrz = false }: IniTextProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: mm(x),
        top: mm(y),
        fontSize: `${size}pt`,
        fontWeight: bold ? 700 : 400,
        lineHeight: 1.1,
        whiteSpace: "pre",
      }}
      className={mrz ? "mrz" : undefined}
    >
      {text}
    </div>
  );
}

// ---------- MRZ helpers (simplified — check digits omitted) ----------
function generateMRZLine1({
  surName = "",
  givenNames = "",
}: {
  surName?: string;
  givenNames?: string;
}): string {
  const name = `${(surName || "").toUpperCase()}<<${(givenNames || "")
    .toUpperCase()
    .replace(/\s+/g, "<")}`.replace(/\s+/g, "<");
  const padded = name.padEnd(39, "<"); // 44 total - 5 (P<PAK)
  return `P<PAK${padded}`;
}

function toYYMMDD(dateLike?: string | Date | null): string {
  if (!dateLike) return "<<<<<<";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "<<<<<<";
  const yy = String(d.getUTCFullYear()).slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function sanitizePersonalNumber(s?: string | number | null): string {
  if (s == null) return "";
  return String(s).replace(/[^0-9A-Z<]/gi, "").replace(/-/g, "");
}

function generateMRZLine2({
  documentNo = "",
  nationality = "PAK",
  birthDate = null,
  gender = "<",
  expiryDate = null,
  personalNumber = "",
}: {
  documentNo?: string;
  nationality?: string;
  birthDate?: string | Date | null;
  gender?: string;
  expiryDate?: string | Date | null;
  personalNumber?: string | number;
}): string {
  const doc = (documentNo || "").toUpperCase().replace(/\s+/g, "").padEnd(9, "<");
  const nat = (nationality || "PAK").toUpperCase();
  const bdate = toYYMMDD(birthDate);
  const g = (gender || "<").toUpperCase().slice(0, 1);
  const edate = toYYMMDD(expiryDate);
  const pnum = sanitizePersonalNumber(personalNumber).toUpperCase().padEnd(14, "<");
  const checkDigit = "0"; // simplified placeholder
  return `${doc}${nat}${bdate}${g}${edate}${pnum}${checkDigit}`;
}