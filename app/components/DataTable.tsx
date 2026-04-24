import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AnimatedTableRow from './AnimatedTableRow';
import React from 'react';

// Assuming DataTableProps is somewhere in global types or imported
interface DataTableProps<T> {
    columns: any[];
    data: T[];
    rowKey: (row: T, index: number) => string;
    tableClassName?: string;
    headerClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string;
    bodyRowClassName?: string;
    bodyCellClassName?: string;
}

const DataTable = <T,>({
    columns,
    data,
    rowKey,
    tableClassName,
    headerClassName,
    headerRowClassName,
    headerCellClassName,
    bodyRowClassName,
    bodyCellClassName,
}: DataTableProps<T>) => {
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
                {data.map((row, rowIndex) => (
                    <AnimatedTableRow
                        key={rowKey(row, rowIndex)}
                        delay={rowIndex * 0.05 + 0.1}
                        className={cn(
                            'overflow-hidden rounded-lg border-purple-100/5 hover:bg-dark-400/30! relative translate-y-0',
                            bodyRowClassName,
                        )}
                    >
                        {columns.map((column, columnIndex) => (
                            <TableCell
                                key={columnIndex}
                                className={cn('py-4 first:pl-5 last:pr-5', bodyCellClassName, column.cellClassName)}
                            >
                                {column.cell(row, rowIndex)}
                            </TableCell>
                        ))}
                    </AnimatedTableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default DataTable;