import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  reason: string;
  onReasonChange: (reason: string) => void;
};

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  reason,
  onReasonChange,
}: Props) => {
  return (
    <Dialog open={isOpen} onClose={onClose} sx={{ padding: 5 }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        <TextField
          autoFocus
          required
          id="reason"
          label="Reason"
          type="text"
          fullWidth
          variant="standard"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onConfirm} disabled={!reason}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
