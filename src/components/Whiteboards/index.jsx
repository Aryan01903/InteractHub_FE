import DashboardHeader from "../common/DashboardHeader";
import DashboardSidebar from "../common/DashboardSidebar";
import CreateWhiteboard from "./CreateWhiteBoard";
import WhiteboardListingTable from "./WhiteboardListingTable";

export default function Whiteboard() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Top Header */}
            <DashboardHeader />

            <div className="flex flex-1">
                {/* Sidebar */}
                <DashboardSidebar />

                {/* Main Content */}
                <section className="flex-1 p-6 overflow-auto ml-6 mt-8">
                    <div className="text-[#333333] max-w-6xl mx-auto">
                        {/* Page Heading */}
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            Your Whiteboards
                        </h1>
                        <p className="mt-2 text-gray-600 text-lg">
                            Create, organize, and collaborate on your
                            whiteboards with ease.
                        </p>

                        {/* Actions + Listing */}
                        <div className="mt-10 space-y-8">
                            <CreateWhiteboard />
                            <WhiteboardListingTable />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
