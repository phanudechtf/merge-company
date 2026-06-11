import { Header } from "@/components/layout/Header";
import { BranchMap3D } from "@/components/retail/BranchMap3D";

export default function BranchMapPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="แผนที่สาขา 3D" breadcrumbs={["Retail", "แผนที่สาขา 3D"]} />
      <BranchMap3D />
    </div>
  );
}
