import { DataTable } from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import Image from "next/image";
import Link from "next/link";

const AdminDashboard = async () => {
  const appointments = await getRecentAppointmentList();
  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14 transform scale-[85%]">
      <header className="admin-header">
        <Link href="/">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        <DataTable columns={columns} data={appointments.documents} />
        <p className="copyright text-center">© CuraLink | 2024-25</p>
      </main>
    </div>
  );
};

export default AdminDashboard;
