export default function Home() {
  return (
    <div className='flex flex-col flex-1 min-h-0 items-center justify-center gap-4 bg-[#05a459]'>
      <img
        src='/ligas/edefi/icono.png'
        alt='Encuentro Deportivo de Fútbol Infantil'
        className='max-w-[420px] w-full object-contain'
      />
      <h2 className='text-5xl font-bold text-green-900 ml-4'>
        Panel Administrativo
      </h2>
    </div>
  )
}
