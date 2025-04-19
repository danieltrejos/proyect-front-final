import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">John Doe</p>
          <p className="text-sm text-muted-foreground">2 Craft IPAs, 1 Stout</p>
        </div>
        <div className="ml-auto font-medium">+$42.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Alice Smith</p>
          <p className="text-sm text-muted-foreground">4 Lagers, 2 Pale Ales</p>
        </div>
        <div className="ml-auto font-medium">+$58.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>RJ</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Robert Johnson</p>
          <p className="text-sm text-muted-foreground">1 Porter, 3 Wheat Beers</p>
        </div>
        <div className="ml-auto font-medium">+$39.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Maria Rodriguez</p>
          <p className="text-sm text-muted-foreground">2 Sour Beers, 1 IPA</p>
        </div>
        <div className="ml-auto font-medium">+$34.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>DW</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">David Wilson</p>
          <p className="text-sm text-muted-foreground">3 Belgian Ales, 2 Stouts</p>
        </div>
        <div className="ml-auto font-medium">+$65.00</div>
      </div>
    </div>
  )
}
