export default function AppLogo() {
    return (
        <>
            <img src="/images/brand/logo.png" alt="" className="size-8 shrink-0 rounded-full" />
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Senanayake PPA</span>
                <span className="text-muted-foreground truncate text-xs">Members & committee</span>
            </div>
        </>
    );
}
