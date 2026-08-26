"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const courses = [
    {
      name: "Building",
      image: "/images/building.jpg",
      description:
        "Barnoota ijaarsaa, building technology fi hojiiwwan construction irratti xiyyeeffate.",
    },
    {
      name: "  BuildingElectrical Installation",
      image: "/images/electrical-installation.jpg",
      description:
        "Electrical installation, wiring fi sirna elektirikii ammayyaa irratti leenjii gahumsa qabu.",
    },
    {
      name: "Structure Construction Work",
      image: "/images/structure-construction.jpg",
      description:
        "Hojii structure, construction fi teknoolojii ijaarsaa irratti beekumsa fi dandeettii.",
    },
    {
      name: "Hardware & Servicing",
      image: "/images/hardware-servicing.jpg",
      description:
        "Computer hardware, maintenance, troubleshooting fi servicing irratti leenjii.",
    },
    {
      name: "Database Administration",
      image: "/images/database.jpg",
      description:
        "Database management, administration fi sirna odeeffannoo ammayyaa irratti leenjii.",
    },
    {
      name: "Industrial Electrical",
      image: "/images/industrial-electrical.jpg",
      description:
        "Industrial electrical systems, control fi hojiiwwan elektirikii industirii irratti xiyyeeffate.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-extrabold text-white shadow-md">
              K
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-extrabold leading-tight text-blue-800">
                Kolleejjii Polii Teeknikaa Arjoo
              </h1>
              <p className="text-xs text-gray-500">
                Technical & Vocational Education
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <Link
              href="/"
              className="hidden font-semibold text-blue-700 transition hover:text-blue-900 sm:block"
            >
              Home
            </Link>

            <Link
              href="/reports"
              className="hidden font-semibold text-gray-700 transition hover:text-blue-700 md:block"
            >
              Reports
            </Link>

            <Link
              href="#about"
              className="hidden font-semibold text-gray-700 transition hover:text-blue-700 md:block"
            >
              About
            </Link>

            <Link
              href="#features"
              className="hidden font-semibold text-gray-700 transition hover:text-blue-700 md:block"
            >
              Features
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 sm:px-5"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 sm:px-5"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600">
        {/* Background decoration */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          
          {/* Hero Text */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">
              🎓 Technical & Vocational Education
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Kolleejjii Polii
              <span className="block text-cyan-300">
                Teeknikaa Arjoo
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100 lg:mx-0">
              Sirna bulchiinsa barnootaa fi leenjii teeknikaa fi ogummaa
              ammayyaa, qulqullina qabu fi bu'a qabeessa ta'e.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-800 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Galmaa'i Amma →
              </Link>

              <Link
                href="#about"
                className="rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Waa'ee Keenya
              </Link>
            </div>

            {/* Statistics */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-7">
              <div>
                <p className="text-2xl font-extrabold text-white">6+</p>
                <p className="text-xs text-blue-200">Courses</p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-white">TVET</p>
                <p className="text-xs text-blue-200">Education</p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-white">CAMS</p>
                <p className="text-xs text-blue-200">Management</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur">
              <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[400px]">
                 <img
                  src="123.jpg"
                  alt="College campus"
                  
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-semibold text-blue-100">
                    College Academic Management System
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">
                    CAMS
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COURSES ================= */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">
            <span className="font-bold uppercase tracking-wider text-blue-700">
              Departments & Courses
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Barnoota Teeknikaa fi Ogummaa
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              Dandeettii hojii, teknoolojii fi ogummaa barattootaa cimsuuf
              barnoota garaagaraa kennamu.
            </p>
          </div>

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.name}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white">
                      TVET
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {course.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center font-semibold text-blue-700">
                    Barnoota Ilaali
                    <span className="ml-2 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>
              <span className="font-bold uppercase tracking-wider text-blue-700">
                Seensa
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Kolleejjii Polii Teeknikaa Arjoo
              </h2>

              <div className="mt-6 h-1 w-20 rounded-full bg-blue-700" />

              <p className="mt-6 text-lg leading-8 text-gray-700">
                Tariimoo BLTO fi Sirna BLTO bu'aarrtti xiyyeeffate karaa
                guutuu ta'een hojiirra oolchuuf karoorri hojii qophaa'ee
                hojiirra oolaa tureera. Bara 2018 ttis karoorri hojii
                walfakkaatu qophaa'ee hojiirraa oolaa jira.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <div className="relative h-[350px]">
                <img
                  src="456.jpg"
                  alt="College campus"
                  
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <div className="grid gap-8 md:grid-cols-2">

            <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                🎯
              </div>

              <h2 className="text-2xl font-extrabold text-blue-800">
                Ergama (Mission)
              </h2>

              <p className="mt-5 leading-8 text-gray-700">
                Fedhii gabaa hojii irratti hundaa'uun barnootaa fi leenjii
                teeknikaa fi ogummaa qulqullinaa fi gahumsa qabu kennuun
                IMX bu'ura industirii taasiisuu fi teeknoolojii bu'aa
                qabeessa ta'e ceesisuun uummata naannoo keenyaa fayyadamaa
                gochuu dha.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                👁️
              </div>

              <h2 className="text-2xl font-extrabold text-blue-800">
                Mul'ata (Vision)
              </h2>

              <p className="mt-5 leading-8 text-gray-700">
                Bara xumura KGT 3ffaatti ogeeyyii gabaan hojii barbaadu
                baay'inaa fi qulqullinaan geessisuu, hundinuu hojitti galanii
                misooma industirii naannicha keessaatti gaggeefamuuf bu'ura
                akka ta'an gochuudha.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Barnoota Kee Har'a Jalqabi
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-100">
            Kolleejjii Polii Teeknikaa Arjoo keessatti ogummaa fi dandeettii
            hojii kee guddisi.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-8 py-4 font-bold text-blue-800 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
          >
            Galmaa'i Amma →
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-950 py-10 text-gray-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">

          <div>
            <h3 className="font-bold text-white">
              Kolleejjii Polii Teeknikaa Arjoo
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              College Academic Management System — CAMS
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kolleejjii Polii Teeknikaa Arjoo.
            All rights reserved.
          </p>

        </div>
      </footer>
    </main>
  );
}