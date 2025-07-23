"use client";

import mockData from "@/mock-data.json";
import { Employee } from "@/schemas/employee-schema";

import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function EmployeesPage() {
  const employees = mockData as Employee[];

  return (
    <main className="flex-center min-h-dvh">
      <DataTable
        columns={columns}
        data={employees}
        onAddNew={() => console.log("Add new employee")}
        onExport={(format) => console.log(`Export as ${format}`)}
        onImport={(file) => console.log("Import file:", file.name)}
        onRefresh={() => console.log("Refresh data")}
        isLoading={false}
      />
    </main>
  );
}
