import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const DataTable = <T,>({ columns, data, rowKey, tableClassName, headerClassName, headerRowClassName, headerCellClassName, bodyRowClassName, bodyCellClassName }: DataTableProps<T>) => {
    return (
        <Table className={cn('custom-scrollbar', tableClassName)}>

            <TableHeader className={headerClassName}>
                <TableRow className={cn('hover:bg-transparent!', headerRowClassName)}>
                    {columns.map((column, i) => (
                        <TableHead
                            key={i}
                            className={cn(
                                'bg-dark-400 text-purple-100 py-4 first:pl-5 last:pr-5',
                                headerCellClassName,
                                column.headClassName,
                            )}
                        >
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">Coin Name</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>6%</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

export default DataTable