import { DataGrid, GridColDef, DataGridProps } from '@mui/x-data-grid'
import { Box, Paper, Typography } from '@mui/material'

type CrudGridProps = {
  rows: any[]
  columns: GridColDef[]
} & Partial<Omit<DataGridProps, 'rows' | 'columns'>>

export default function CrudGrid({ rows, columns, ...otherProps }: CrudGridProps) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          {...otherProps}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(15,61,48,0.04)',
              borderBottom: '1px solid rgba(27,26,23,0.08)',
              fontWeight: 600
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(27,26,23,0.06)'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(213,121,75,0.08)'
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No records yet. Start by adding a new entry.
                </Typography>
              </Box>
            )
          }}
        />
      </Box>
    </Paper>
  )
}
