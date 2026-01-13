import ProfileInfo from "./components/ProfileInfo";

export default function Settings() {
  return (
    <main>
      <h1 className="text-4xl font-medium pl-15 lg:pl-0 mb-3">Профиль</h1>
      <p className="text-sm text-[#999] lg:text-lg mb-10">Управление личными данными</p>

      <ProfileInfo />
    </main>
  )
}