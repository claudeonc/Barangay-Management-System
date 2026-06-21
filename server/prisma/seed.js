import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const adminResident = await prisma.resident.create({
    data: {
      FirstName: 'System',
      LastName: 'Admin',
      Birthdate: new Date('1990-01-01'),
      Gender: 'Male',
      CivilStatus: 'Single',
    }
  });

  const adminPersonnel = await prisma.personnel.create({
    data: {
      ResidentID: adminResident.ResidentID,
      Position: 'Barangay Secretary',
      EmploymentType: 'Full-Time',
    }
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      Username: 'admin',
      Password: hashedPassword,
      Role: 'SUPER_ADMIN',
      PersonnelID: adminPersonnel.PersonnelID
    }
  });

  console.log(`Created default Personnel with ID: ${adminPersonnel.PersonnelID}`);
  console.log(`Created default User with Username: ${adminUser.Username}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
