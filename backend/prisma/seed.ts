// prisma/seed.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "bisu-procurement",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...\n");

  // -------------------------------------------------------
  // ROLES
  // -------------------------------------------------------
  console.log("📌 Seeding roles...");
  const roles = await Promise.all([
    prisma.roles.upsert({
      where: { name: "REQUESTER" },
      update: {},
      create: {
        name: "REQUESTER",
        description: "Faculty / office staff who submits Purchase Requests",
      },
    }),
    prisma.roles.upsert({
      where: { name: "APPROVER" },
      update: {},
      create: {
        name: "APPROVER",
        description:
          "Campus administrator / authority who approves Purchase Requests",
      },
    }),
    prisma.roles.upsert({
      where: { name: "PROCUREMENT_OFFICER" },
      update: {},
      create: {
        name: "PROCUREMENT_OFFICER",
        description: "Procurement staff who processes approved PRs",
      },
    }),
    prisma.roles.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
        description: "System administrator with full access",
      },
    }),
    prisma.roles.upsert({
      where: { name: "IT" },
      update: {},
      create: {
        name: "IT",
        description: "IT personnel for system maintenance",
      },
    }),
  ]);

  const [roleRequester, roleApprover, roleProcurement, roleAdmin, roleIT] =
    roles;
  console.log(`   ✅ ${roles.length} roles seeded`);

  // -------------------------------------------------------
  // DEPARTMENTS
  // -------------------------------------------------------
  console.log("🏢 Seeding departments...");
  const departments = await Promise.all([
    prisma.departments.upsert({
      where: { code: "COT" },
      update: {},
      create: { code: "COT", name: "College of Technology" },
    }),
    prisma.departments.upsert({
      where: { code: "ADMIN" },
      update: {},
      create: { code: "ADMIN", name: "Administration Office" },
    }),
    prisma.departments.upsert({
      where: { code: "LIB" },
      update: {},
      create: { code: "LIB", name: "Library" },
    }),
    prisma.departments.upsert({
      where: { code: "ACCT" },
      update: {},
      create: { code: "ACCT", name: "Accounting Office" },
    }),
    prisma.departments.upsert({
      where: { code: "REGISTRAR" },
      update: {},
      create: { code: "REGISTRAR", name: "Registrar Office" },
    }),
    prisma.departments.upsert({
      where: { code: "PROCUREMENT" },
      update: {},
      create: { code: "PROCUREMENT", name: "Procurement Office" },
    }),
    prisma.departments.upsert({
      where: { code: "IT_DEPT" },
      update: {},
      create: { code: "IT_DEPT", name: "IT Department" },
    }),
  ]);

  const [
    deptCOT,
    deptAdmin,
    deptLib,
    deptAcct,
    deptRegistrar,
    deptProcurement,
    deptIT,
  ] = departments;
  console.log(`   ✅ ${departments.length} departments seeded`);

  // -------------------------------------------------------
  // ITEM CATEGORIES
  // -------------------------------------------------------
  console.log("🏷️  Seeding item categories...");
  const categories = await Promise.all([
    prisma.item_categories.upsert({
      where: { code: "SUPPLIES" },
      update: {},
      create: {
        code: "SUPPLIES",
        name: "Office Supplies",
        description: "General office and administrative supplies",
      },
    }),
    prisma.item_categories.upsert({
      where: { code: "EQUIPMENT" },
      update: {},
      create: {
        code: "EQUIPMENT",
        name: "Equipment",
        description: "Machinery, computers, and equipment",
      },
    }),
    prisma.item_categories.upsert({
      where: { code: "FURNITURE" },
      update: {},
      create: {
        code: "FURNITURE",
        name: "Furniture & Fixtures",
        description: "Tables, chairs, and cabinets",
      },
    }),
    prisma.item_categories.upsert({
      where: { code: "BOOKS" },
      update: {},
      create: {
        code: "BOOKS",
        name: "Books & Materials",
        description: "Reference books and learning materials",
      },
    }),
    prisma.item_categories.upsert({
      where: { code: "REPAIRS" },
      update: {},
      create: {
        code: "REPAIRS",
        name: "Repairs & Services",
        description: "Maintenance and repair services",
      },
    }),
    prisma.item_categories.upsert({
      where: { code: "IT_TECH" },
      update: {},
      create: {
        code: "IT_TECH",
        name: "IT & Technology",
        description: "Software, hardware, and tech accessories",
      },
    }),
  ]);

  const [
    catSupplies,
    catEquipment,
    _catFurniture,
    catBooks,
    catRepairs,
    catIT,
  ] = categories;
  console.log(`   ✅ ${categories.length} item categories seeded`);

  // -------------------------------------------------------
  // APPROVAL STEPS
  // -------------------------------------------------------
  console.log("📋 Seeding approval steps...");
  await prisma.approval_steps.upsert({
    where: { step_order: 1 },
    update: {},
    create: {
      step_order: 1,
      step_name: "Department Head Review",
      role_id: roleApprover.id,
    },
  });
  await prisma.approval_steps.upsert({
    where: { step_order: 2 },
    update: {},
    create: {
      step_order: 2,
      step_name: "Budget Officer Review",
      role_id: roleProcurement.id,
    },
  });
  await prisma.approval_steps.upsert({
    where: { step_order: 3 },
    update: {},
    create: {
      step_order: 3,
      step_name: "Campus Administrator Approval",
      role_id: roleAdmin.id,
    },
  });
  console.log("   ✅ 3 approval steps seeded");

  // -------------------------------------------------------
  // USERS
  // -------------------------------------------------------
  console.log("👤 Seeding users...");

  const hashPassword = async (plain: string) => bcrypt.hash(plain, 10);

  const admin = await prisma.users.upsert({
    where: { email: "admin@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-001",
      first_name: "Juan",
      last_name: "Dela Cruz",
      email: "admin@bisu.edu.ph",
      password_hash: await hashPassword("Admin@123"),
      role_id: roleAdmin.id,
      department_id: deptAdmin.id,
    },
  });

  const requester = await prisma.users.upsert({
    where: { email: "requester@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-002",
      first_name: "Maria",
      last_name: "Santos",
      email: "requester@bisu.edu.ph",
      password_hash: await hashPassword("s@123"),
      role_id: roleRequester.id,
      department_id: deptCOT.id,
    },
  });

  const approver = await prisma.users.upsert({
    where: { email: "approver@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-003",
      first_name: "Pedro",
      last_name: "Reyes",
      email: "approver@bisu.edu.ph",
      password_hash: await hashPassword("User@123"),
      role_id: roleApprover.id,
      department_id: deptAdmin.id,
    },
  });

  const procurement = await prisma.users.upsert({
    where: { email: "procurement@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-004",
      first_name: "Ana",
      last_name: "Garcia",
      email: "procurement@bisu.edu.ph",
      password_hash: await hashPassword("User@123"),
      role_id: roleProcurement.id,
      department_id: deptProcurement.id,
    },
  });

  const itUser = await prisma.users.upsert({
    where: { email: "it@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-005",
      first_name: "Carlo",
      last_name: "Mendoza",
      email: "it@bisu.edu.ph",
      password_hash: await hashPassword("User@123"),
      role_id: roleIT.id,
      department_id: deptIT.id,
    },
  });

  const requester2 = await prisma.users.upsert({
    where: { email: "librarian@bisu.edu.ph" },
    update: {},
    create: {
      employee_id: "BISU-2024-006",
      first_name: "Rosa",
      last_name: "Lim",
      email: "librarian@bisu.edu.ph",
      password_hash: await hashPassword("User@123"),
      role_id: roleRequester.id,
      department_id: deptLib.id,
    },
  });

  console.log("   ✅ 6 users seeded");
  console.log("\n   📧 Login credentials:");
  console.log("   ┌─────────────────────────────────────────────────┐");
  console.log("   │  Admin      → admin@bisu.edu.ph / Admin@123     │");
  console.log("   │  Requester  → requester@bisu.edu.ph / User@123  │");
  console.log("   │  Approver   → approver@bisu.edu.ph / User@123   │");
  console.log("   │  Procure    → procurement@bisu.edu.ph / User@123 │");
  console.log("   │  IT         → it@bisu.edu.ph / User@123         │");
  console.log("   │  Librarian  → librarian@bisu.edu.ph / User@123  │");
  console.log("   └─────────────────────────────────────────────────┘\n");

  // -------------------------------------------------------
  // PURCHASE REQUESTS
  // -------------------------------------------------------
  console.log("📄 Seeding purchase requests...");

  // PR 1 — SUBMITTED (office supplies)
  const pr1 = await prisma.purchase_requests.create({
    data: {
      pr_number: "PR-2026-00001",
      title: "Office Supplies for Q2 2026",
      purpose:
        "Procurement of essential office supplies needed for the daily operations of the College of Technology for the second quarter of 2026.",
      requested_by: requester.id,
      department_id: deptCOT.id,
      total_amount: 8300.0,
      status: "SUBMITTED",
      priority: "NORMAL",
      date_needed: new Date("2026-05-15"),
      remarks: "Please prioritize bond papers and printer ink.",
      ml_category_id: catSupplies.id,
      ml_confidence: 0.9412,
      prLineItems: {
        create: [
          {
            description: "Bond Paper Short (500 sheets/ream)",
            unit: "ream",
            quantity: 20,
            unit_price: 250.0,
            category_id: catSupplies.id,
            specifications: "70gsm, short bond paper",
          },
          {
            description: "Ballpen Black",
            unit: "box",
            quantity: 5,
            unit_price: 120.0,
            category_id: catSupplies.id,
            specifications: "0.5mm tip, 12 pcs per box",
          },
          {
            description: "Printer Ink Cartridge Black",
            unit: "piece",
            quantity: 4,
            unit_price: 450.0,
            category_id: catIT.id,
            specifications: "Compatible with Epson L3210",
          },
        ],
      },
    },
  });

  // PR 2 — APPROVED (computer equipment)
  const pr2 = await prisma.purchase_requests.create({
    data: {
      pr_number: "PR-2026-00002",
      title: "Computer Laboratory Equipment Upgrade",
      purpose:
        "Upgrade of computer laboratory equipment to support the BS Computer Science curriculum requirements and improve student learning experience.",
      requested_by: requester.id,
      department_id: deptCOT.id,
      total_amount: 451500.0,
      status: "APPROVED",
      priority: "HIGH",
      date_needed: new Date("2026-06-01"),
      remarks: "Equipment needed before the start of second semester.",
      ml_category_id: catEquipment.id,
      ml_confidence: 0.9876,
      prLineItems: {
        create: [
          {
            description: "Desktop Computer (Core i5, 16GB RAM, 512GB SSD)",
            unit: "unit",
            quantity: 10,
            unit_price: 35000.0,
            category_id: catEquipment.id,
            specifications:
              "Intel Core i5-12400, 16GB DDR4, 512GB NVMe SSD, Windows 11 Pro",
          },
          {
            description: "24-inch LED Monitor",
            unit: "unit",
            quantity: 10,
            unit_price: 8500.0,
            category_id: catEquipment.id,
            specifications: "Full HD 1080p, 75Hz, IPS Panel",
          },
          {
            description: "Mechanical Keyboard",
            unit: "unit",
            quantity: 10,
            unit_price: 1200.0,
            category_id: catEquipment.id,
            specifications: "USB, full size, with numpad",
          },
          {
            description: "Optical Mouse",
            unit: "unit",
            quantity: 10,
            unit_price: 350.0,
            category_id: catEquipment.id,
            specifications: "USB wired, 1000 DPI",
          },
        ],
      },
    },
  });

  // PR 3 — REJECTED (urgent repair)
  const pr3 = await prisma.purchase_requests.create({
    data: {
      pr_number: "PR-2026-00003",
      title: "Emergency Repair of Air Conditioning Units",
      purpose:
        "Urgent repair of malfunctioning air conditioning units in the faculty room and computer laboratory.",
      requested_by: requester.id,
      department_id: deptAdmin.id,
      total_amount: 12900.0,
      status: "REJECTED",
      priority: "URGENT",
      date_needed: new Date("2026-04-25"),
      remarks: "Units have been non-operational for 2 weeks.",
      ml_category_id: catRepairs.id,
      ml_confidence: 0.8821,
      prLineItems: {
        create: [
          {
            description: "AC Unit Repair Service (2HP Split Type)",
            unit: "unit",
            quantity: 3,
            unit_price: 2500.0,
            category_id: catRepairs.id,
            specifications: "Includes labor and cleaning",
          },
          {
            description: "Refrigerant Gas Refill (R-32)",
            unit: "unit",
            quantity: 3,
            unit_price: 1800.0,
            category_id: catRepairs.id,
            specifications: "R-32 refrigerant, 1kg per unit",
          },
        ],
      },
    },
  });

  // PR 4 — DRAFT (library books)
  const pr4 = await prisma.purchase_requests.create({
    data: {
      pr_number: "PR-2026-00004",
      title: "Library Books and Reference Materials",
      purpose:
        "Acquisition of new books and reference materials for the university library to support academic research and studies.",
      requested_by: requester2.id,
      department_id: deptLib.id,
      total_amount: 22250.0,
      status: "DRAFT",
      priority: "LOW",
      date_needed: new Date("2026-07-01"),
      remarks: "Book list approved by the library committee.",
      ml_category_id: catBooks.id,
      ml_confidence: 0.9134,
      prLineItems: {
        create: [
          {
            description: "Programming Books (various titles)",
            unit: "piece",
            quantity: 15,
            unit_price: 850.0,
            category_id: catBooks.id,
            specifications: "Latest editions, 2023-2026",
          },
          {
            description: "Database Management Textbooks",
            unit: "piece",
            quantity: 10,
            unit_price: 950.0,
            category_id: catBooks.id,
            specifications: "Latest editions",
          },
        ],
      },
    },
  });

  // PR 5 — UNDER_REVIEW (accounting supplies)
  const pr5 = await prisma.purchase_requests.create({
    data: {
      pr_number: "PR-2026-00005",
      title: "Accounting Office Supplies and Printer Consumables",
      purpose:
        "Monthly replenishment of accounting office supplies and printer consumables for financial document processing.",
      requested_by: requester.id,
      department_id: deptAcct.id,
      total_amount: 15600.0,
      status: "UNDER_REVIEW",
      priority: "NORMAL",
      date_needed: new Date("2026-05-01"),
      ml_category_id: catSupplies.id,
      ml_confidence: 0.9023,
      prLineItems: {
        create: [
          {
            description: "A4 Bond Paper (80gsm)",
            unit: "ream",
            quantity: 30,
            unit_price: 280.0,
            category_id: catSupplies.id,
          },
          {
            description: "Toner Cartridge (HP LaserJet)",
            unit: "piece",
            quantity: 4,
            unit_price: 2850.0,
            category_id: catIT.id,
          },
          {
            description: "Folder Long (100pcs/pack)",
            unit: "pack",
            quantity: 5,
            unit_price: 120.0,
            category_id: catSupplies.id,
          },
        ],
      },
    },
  });

  console.log("   ✅ 5 purchase requests seeded");

  // -------------------------------------------------------
  // APPROVAL RECORDS
  // -------------------------------------------------------
  console.log("✅ Seeding approval records...");

  const step1 = await prisma.approval_steps.findFirst({
    where: { step_order: 1 },
  });
  const step2 = await prisma.approval_steps.findFirst({
    where: { step_order: 2 },
  });
  const step3 = await prisma.approval_steps.findFirst({
    where: { step_order: 3 },
  });

  if (!step1 || !step2 || !step3) throw new Error("Approval steps not found");

  // PR1 — SUBMITTED: pending step 1
  await prisma.pr_approvals.create({
    data: {
      purchase_request_id: pr1.id,
      approval_step_id: step1.id,
      action: "PENDING",
    },
  });

  // PR2 — APPROVED: all 3 steps approved
  await prisma.pr_approvals.createMany({
    data: [
      {
        purchase_request_id: pr2.id,
        approval_step_id: step1.id,
        approver_id: approver.id,
        action: "APPROVED",
        remarks: "Items are necessary for the CS curriculum.",
        acted_at: new Date("2026-03-10T09:00:00"),
      },
      {
        purchase_request_id: pr2.id,
        approval_step_id: step2.id,
        approver_id: procurement.id,
        action: "APPROVED",
        remarks: "Budget is available for this quarter.",
        acted_at: new Date("2026-03-11T10:30:00"),
      },
      {
        purchase_request_id: pr2.id,
        approval_step_id: step3.id,
        approver_id: admin.id,
        action: "APPROVED",
        remarks: "Final approval granted.",
        acted_at: new Date("2026-03-12T14:00:00"),
      },
    ],
  });

  // PR3 — REJECTED: step 1 rejected
  await prisma.pr_approvals.create({
    data: {
      purchase_request_id: pr3.id,
      approval_step_id: step1.id,
      approver_id: approver.id,
      action: "REJECTED",
      remarks:
        "Budget allocation for maintenance this quarter has been exhausted. Please resubmit next quarter.",
      acted_at: new Date("2026-04-10T11:00:00"),
    },
  });

  // PR5 — UNDER_REVIEW: step 1 approved, step 2 pending
  await prisma.pr_approvals.createMany({
    data: [
      {
        purchase_request_id: pr5.id,
        approval_step_id: step1.id,
        approver_id: approver.id,
        action: "APPROVED",
        remarks: "Supplies are needed for monthly operations.",
        acted_at: new Date("2026-04-15T08:30:00"),
      },
      {
        purchase_request_id: pr5.id,
        approval_step_id: step2.id,
        action: "PENDING",
      },
    ],
  });

  console.log("   ✅ Approval records seeded");

  // -------------------------------------------------------
  // TRACKING LOGS
  // -------------------------------------------------------
  console.log("🗺️  Seeding tracking logs...");

  await prisma.tracking_logs.createMany({
    data: [
      // PR1 trail
      {
        purchase_request_id: pr1.id,
        from_user_id: requester.id,
        from_office: "College of Technology",
        to_office: "Department Head Office",
        status_before: "DRAFT",
        status_after: "SUBMITTED",
        action: "SUBMITTED",
        remarks: "Purchase Request submitted for approval.",
        created_at: new Date("2026-04-18T08:00:00"),
      },
      // PR2 trail
      {
        purchase_request_id: pr2.id,
        from_user_id: requester.id,
        from_office: "College of Technology",
        to_office: "Department Head Office",
        status_before: "DRAFT",
        status_after: "SUBMITTED",
        action: "SUBMITTED",
        remarks: "Purchase Request submitted for approval.",
        created_at: new Date("2026-03-08T09:00:00"),
      },
      {
        purchase_request_id: pr2.id,
        from_user_id: approver.id,
        from_office: "Department Head Office",
        to_office: "Procurement Office",
        status_before: "SUBMITTED",
        status_after: "UNDER_REVIEW",
        action: "FORWARDED",
        remarks: "Approved by Department Head. Forwarded to Procurement.",
        created_at: new Date("2026-03-10T09:05:00"),
      },
      {
        purchase_request_id: pr2.id,
        from_user_id: procurement.id,
        from_office: "Procurement Office",
        to_office: "Campus Administrator Office",
        status_before: "UNDER_REVIEW",
        status_after: "UNDER_REVIEW",
        action: "FORWARDED",
        remarks: "Budget verified. Forwarded to Campus Administrator.",
        created_at: new Date("2026-03-11T10:35:00"),
      },
      {
        purchase_request_id: pr2.id,
        from_user_id: admin.id,
        from_office: "Campus Administrator Office",
        to_office: "Procurement Office",
        status_before: "UNDER_REVIEW",
        status_after: "APPROVED",
        action: "APPROVED",
        remarks: "Final approval granted. Proceed with procurement.",
        created_at: new Date("2026-03-12T14:05:00"),
      },
      // PR3 trail
      {
        purchase_request_id: pr3.id,
        from_user_id: requester.id,
        from_office: "Administration Office",
        to_office: "Department Head Office",
        status_before: "DRAFT",
        status_after: "SUBMITTED",
        action: "SUBMITTED",
        remarks: "Urgent repair request submitted.",
        created_at: new Date("2026-04-09T07:30:00"),
      },
      {
        purchase_request_id: pr3.id,
        from_user_id: approver.id,
        from_office: "Department Head Office",
        to_office: "Administration Office",
        status_before: "SUBMITTED",
        status_after: "REJECTED",
        action: "REJECTED",
        remarks: "Budget allocation exhausted. Please resubmit next quarter.",
        created_at: new Date("2026-04-10T11:05:00"),
      },
      // PR5 trail
      {
        purchase_request_id: pr5.id,
        from_user_id: requester.id,
        from_office: "Accounting Office",
        to_office: "Department Head Office",
        status_before: "DRAFT",
        status_after: "SUBMITTED",
        action: "SUBMITTED",
        remarks: "Monthly replenishment request submitted.",
        created_at: new Date("2026-04-14T08:00:00"),
      },
      {
        purchase_request_id: pr5.id,
        from_user_id: approver.id,
        from_office: "Department Head Office",
        to_office: "Procurement Office",
        status_before: "SUBMITTED",
        status_after: "UNDER_REVIEW",
        action: "FORWARDED",
        remarks: "Approved by Department Head. For budget verification.",
        created_at: new Date("2026-04-15T08:35:00"),
      },
    ],
  });

  console.log("   ✅ Tracking logs seeded");

  // -------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------
  console.log("🔔 Seeding notifications...");

  await prisma.notifications.createMany({
    data: [
      {
        user_id: requester.id,
        purchase_request_id: pr1.id,
        type: "PR_SUBMITTED",
        title: "PR Submitted Successfully",
        message: `Your PR ${pr1.pr_number} — "${pr1.title}" has been submitted and is awaiting approval.`,
        is_read: false,
        created_at: new Date("2026-04-18T08:00:00"),
      },
      {
        user_id: approver.id,
        purchase_request_id: pr1.id,
        type: "PENDING_ACTION",
        title: "New PR Awaiting Your Approval",
        message: `PR ${pr1.pr_number} — "${pr1.title}" submitted by Maria Santos requires your review.`,
        is_read: false,
        created_at: new Date("2026-04-18T08:01:00"),
      },
      {
        user_id: requester.id,
        purchase_request_id: pr2.id,
        type: "PR_APPROVED",
        title: "PR Approved",
        message: `Your PR ${pr2.pr_number} — "${pr2.title}" has been fully approved. Total amount: ₱451,500.00.`,
        is_read: true,
        created_at: new Date("2026-03-12T14:05:00"),
      },
      {
        user_id: requester.id,
        purchase_request_id: pr3.id,
        type: "PR_REJECTED",
        title: "PR Rejected",
        message: `Your PR ${pr3.pr_number} — "${pr3.title}" has been rejected. Reason: Budget allocation exhausted. Please resubmit next quarter.`,
        is_read: true,
        created_at: new Date("2026-04-10T11:05:00"),
      },
      {
        user_id: requester.id,
        purchase_request_id: pr5.id,
        type: "PR_SUBMITTED",
        title: "PR Submitted Successfully",
        message: `Your PR ${pr5.pr_number} — "${pr5.title}" has been submitted and is under review.`,
        is_read: false,
        created_at: new Date("2026-04-14T08:00:00"),
      },
      {
        user_id: procurement.id,
        purchase_request_id: pr5.id,
        type: "PENDING_ACTION",
        title: "PR Awaiting Budget Verification",
        message: `PR ${pr5.pr_number} — "${pr5.title}" has been forwarded to you for budget verification.`,
        is_read: false,
        created_at: new Date("2026-04-15T08:35:00"),
      },
      {
        user_id: admin.id,
        type: "SYSTEM",
        title: "System Initialized",
        message:
          "BISU-Bilar Procurement MIS has been successfully initialized and is ready for use.",
        is_read: false,
        created_at: new Date("2026-04-20T00:00:00"),
      },
    ],
  });

  console.log("   ✅ Notificationss seeded");

  // -------------------------------------------------------
  // ML CLASSIFICATION HISTORY
  // -------------------------------------------------------
  console.log("🤖 Seeding ML classification history...");

  await prisma.ml_classifications.createMany({
    data: [
      {
        purchase_request_id: pr1.id,
        input_text:
          "Office Supplies for Q2 2026 — bond paper, ballpen, printer ink cartridge for College of Technology",
        predicted_category: catSupplies.id,
        confidence: 0.9412,
        model_version: "v1.0.0-placeholder",
        raw_output: JSON.stringify({
          predictions: [
            { category: "SUPPLIES", confidence: 0.9412 },
            { category: "IT_TECH", confidence: 0.0412 },
            { category: "EQUIPMENT", confidence: 0.0176 },
          ],
        }),
      },
      {
        purchase_request_id: pr2.id,
        input_text:
          "Computer Laboratory Equipment Upgrade — desktop computers, monitors, keyboards, mice for BS Computer Science",
        predicted_category: catEquipment.id,
        confidence: 0.9876,
        model_version: "v1.0.0-placeholder",
        raw_output: JSON.stringify({
          predictions: [
            { category: "EQUIPMENT", confidence: 0.9876 },
            { category: "IT_TECH", confidence: 0.0098 },
            { category: "SUPPLIES", confidence: 0.0026 },
          ],
        }),
      },
      {
        purchase_request_id: pr3.id,
        input_text:
          "Emergency Repair of Air Conditioning Units — AC repair service and refrigerant gas refill",
        predicted_category: catRepairs.id,
        confidence: 0.8821,
        model_version: "v1.0.0-placeholder",
        raw_output: JSON.stringify({
          predictions: [
            { category: "REPAIRS", confidence: 0.8821 },
            { category: "EQUIPMENT", confidence: 0.0921 },
            { category: "SUPPLIES", confidence: 0.0258 },
          ],
        }),
      },
      {
        purchase_request_id: pr4.id,
        input_text:
          "Library Books and Reference Materials — programming books and database management textbooks",
        predicted_category: catBooks.id,
        confidence: 0.9134,
        model_version: "v1.0.0-placeholder",
        raw_output: JSON.stringify({
          predictions: [
            { category: "BOOKS", confidence: 0.9134 },
            { category: "SUPPLIES", confidence: 0.0622 },
            { category: "IT_TECH", confidence: 0.0244 },
          ],
        }),
      },
      {
        purchase_request_id: pr5.id,
        input_text:
          "Accounting Office Supplies and Printer Consumables — bond paper, toner cartridge, folder",
        predicted_category: catSupplies.id,
        confidence: 0.9023,
        model_version: "v1.0.0-placeholder",
        raw_output: JSON.stringify({
          predictions: [
            { category: "SUPPLIES", confidence: 0.9023 },
            { category: "IT_TECH", confidence: 0.0712 },
            { category: "EQUIPMENT", confidence: 0.0265 },
          ],
        }),
      },
    ],
  });

  console.log("   ✅ ML classification history seeded");

  // -------------------------------------------------------
  // DONE
  // -------------------------------------------------------
  console.log("\n🎉 Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   Roles:              ${roles.length}`);
  console.log(`   Departments:        ${departments.length}`);
  console.log(`   Item Categories:    ${categories.length}`);
  console.log(`   Approval Steps:     3`);
  console.log(`   Users:              6`);
  console.log(`   Purchase Requests:  5`);
  console.log(`   Approval Records:   7`);
  console.log(`   Tracking Logs:      9`);
  console.log(`   Notifications:      7`);
  console.log(`   ML Classifications: 5`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
