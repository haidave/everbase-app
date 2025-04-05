import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          backgroundColor: 'var(--popover)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
