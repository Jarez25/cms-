import CategoriesManager from "@/components/admin/CategoriesManager";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500 mt-1">
          Organiza tus productos en categorías (como en WordPress/WooCommerce).
        </p>
      </div>
      <CategoriesManager />
    </div>
  );
}
