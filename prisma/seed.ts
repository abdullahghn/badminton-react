// prisma/seed.ts
import { PrismaClient, Role, DayType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Seed Default Admin, Manager & Reception Accounts
  await prisma.user.upsert({
    where: { phone: '0500000001' },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      name: 'Super Admin',
      phone: '0500000001',
      email: 'admin@badminton.sa',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { phone: '0500000002' },
    update: { password: hashedPassword, role: Role.MANAGER },
    create: {
      name: 'Facility Manager',
      phone: '0500000002',
      email: 'manager@badminton.sa',
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { phone: '0500000003' },
    update: { password: hashedPassword, role: Role.STAFF },
    create: {
      name: 'Front Desk',
      phone: '0500000003',
      email: 'reception@badminton.sa',
      password: hashedPassword,
      role: Role.STAFF,
    },
  });

  // 2. Create Default Facility Settings
  await prisma.facilitySetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      operatingStartHour: 16, // 4:00 PM
      operatingEndHour: 24,   // 12:00 AM
      slotHoldDurationMins: 10,
      cancellationBufferHours: 24,
    },
  });

  // 3. Create Initial Court 1
  await prisma.court.upsert({
    where: { id: 'court-1' },
    update: {},
    create: {
      id: 'court-1',
      name: 'Court 1 (Indoor)',
      isActive: true,
    },
  });

  // 4. Create Default Pricing Rules (Updated Model)
  const defaultRules = [
    {
      name: 'Standard Off-Peak',
      dayType: DayType.WEEKDAY,
      startHour: 8,
      endHour: 17,
      ratePerHour: 80.00,
      isPeak: false,
      isActive: true,
    },
    {
      name: 'Prime Evening Surge',
      dayType: DayType.WEEKDAY,
      startHour: 17,
      endHour: 23,
      ratePerHour: 120.00,
      isPeak: true,
      isActive: true,
    },
    {
      name: 'Weekend Full Day',
      dayType: DayType.WEEKEND,
      startHour: 8,
      endHour: 23,
      ratePerHour: 140.00,
      isPeak: true,
      isActive: true,
    },
  ];

  for (const rule of defaultRules) {
    const existingRule = await prisma.pricingRule.findFirst({
      where: { name: rule.name },
    });

    if (!existingRule) {
      await prisma.pricingRule.create({
        data: rule,
      });
    }
  }

  console.log('✅ Database seeded with Users (Admin, Manager, Staff), Court 1, Facility Settings, and Pricing Rules!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });