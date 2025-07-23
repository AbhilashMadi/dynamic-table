"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import {
  CopyIcon,
  DeleteIcon,
  DetailsIcon,
  EditIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Employee } from "@/schemas/employee-schema";

export const columns: ColumnDef<Employee>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <code className="text-xs bg-accent p-1 rounded">{row.getValue("id")}</code>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("email")}`}
        className="text-primary hover:underline"
      >
        {row.getValue("email")}
      </a>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const cellNum: string = row.getValue("phone");
      return <a className="text-primary hover:underline" href={`tel:${cellNum}`}>{cellNum}</a>
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const department = row.getValue("department") as string;
      const departmentColors: Record<string, string> = {
        Engineering:
          "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
        Marketing:
          "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
        Sales:
          "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
        HR: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
        Finance:
          "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
        Design:
          "bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
        Product:
          "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
        Operations:
          "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
        Legal:
          "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",
        "Customer Success":
          "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
        Security:
          "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
      };
      return (
        <Badge
          variant="secondary"
          className={cn(departmentColors[department] || "", "border-0")}
        >
          {department}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("position")}</div>,
  },
  {
    accessorKey: "salary",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Salary
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const salary = parseFloat(row.getValue("salary"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(salary);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      return row.getValue(id) === (value === "active");
    },
  },
  {
    accessorKey: "performanceRating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = parseFloat(row.getValue("performanceRating"));
      const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "text-green-600 dark:text-green-500";
        if (rating >= 4.0) return "text-blue-600 dark:text-blue-500";
        if (rating >= 3.5) return "text-yellow-600 dark:text-yellow-500";
        return "text-red-600 dark:text-red-500";
      };
      return (
        <div className={`font-medium ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => <div>{row.getValue("manager")}</div>,
  },
  {
    accessorKey: "skills",
    header: "Skills",
    cell: ({ row }) => {
      const skills = row.getValue("skills") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "projects",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Projects
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("projects")}</div>
    ),
  },
  {
    accessorKey: "vacationDays",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vacation Days
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("vacationDays")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.id)}
            >
              <CopyIcon />
              Copy employee ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <DetailsIcon />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <EditIcon /> Edit employee
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <DeleteIcon /> Delete employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Column visibility presets
export const columnPresets = {
  default: [
    "select",
    "id",
    "firstName",
    "lastName",
    "email",
    "department",
    "position",
    "isActive",
    "actions",
  ],
  detailed: [
    "select",
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "department",
    "position",
    "salary",
    "startDate",
    "isActive",
    "performanceRating",
    "manager",
    "projects",
    "vacationDays",
    "actions",
  ],
  compact: [
    "select",
    "firstName",
    "lastName",
    "department",
    "position",
    "actions",
  ],
};
