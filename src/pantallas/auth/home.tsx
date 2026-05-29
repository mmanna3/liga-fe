export default function Home() {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-6 rounded-2xl border border-slate-200/80 bg-white px-10 py-12 shadow-lg sm:px-16 sm:py-14'>
        <img
          src='/ligas/edefi/icono.png'
          alt='Encuentro Deportivo de Fútbol Infantil'
          className='max-w-[320px] w-full object-contain'
        />
        <div className='text-center space-y-1'>
          <h2 className='text-3xl font-semibold tracking-tight text-slate-800'>
            Panel Administrativo
          </h2>
          <p className='text-sm text-muted-foreground'>
            Encuentro Deportivo de Fútbol Infantil
          </p>
        </div>
      </div>
    </div>
  )
}
