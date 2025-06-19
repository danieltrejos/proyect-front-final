import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Maria Perez</p>
          <p className="text-sm text-muted-foreground">2 Club Colombia, 1 Aguila</p>
        </div>
        <div className="ml-auto font-medium">+$42000.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Alicia Montiel</p>
          <p className="text-sm text-muted-foreground">4 Heaineken, 2 Costeña</p>
        </div>
        <div className="ml-auto font-medium">+$58000.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>RJ</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Roberto Roena</p>
          <p className="text-sm text-muted-foreground">1 Costeñita, 3 Costeñas</p>
        </div>
        <div className="ml-auto font-medium">+$39000.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Maria Rodriguez</p>
          <p className="text-sm text-muted-foreground">2 Bock, 2 Club Colombia</p>
        </div>
        <div className="ml-auto font-medium">+$34000.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>DW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">David Wilson</p>
          <p className="text-sm text-muted-foreground">3 Belgian Ales, 2 Stouts</p>
        </div>
        <div className="ml-auto font-medium">+$65000.00</div>
      </div>
    </div>
  )
}
