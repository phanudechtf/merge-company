import { Header } from "@/components/layout/Header";
import { Warehouse3D } from "@/components/retail/Warehouse3D";

export default function Warehouse3DPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="โกดัง 3D" breadcrumbs={["Retail", "โกดัง 3D"]} />
      <Warehouse3D />
    </div>
  );
}
