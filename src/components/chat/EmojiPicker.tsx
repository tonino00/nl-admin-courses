import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Grid,
  Typography,
  Tooltip
} from '@mui/material';
import AddReactionIcon from '@mui/icons-material/AddReaction';

// Emoji categorias e seus emojis populares
const EMOJI_CATEGORIES = [
  {
    name: 'Expressões',
    emojis: ['😊', '😂', '🥰', '😍', '😎', '😢', '😡', '🤔', '😴', '🙄', '😮', '🤐', '😷']
  },
  {
    name: 'Gestos',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '👋', '👆', '👉', '👈', '🤘', '✊', '👊']
  },
  {
    name: 'Objetos',
    emojis: ['❤️', '💯', '🔥', '⭐', '🎉', '🎁', '📝', '📚', '💻', '🎵', '⏰', '📞', '📷']
  },
  {
    name: 'Símbolos',
    emojis: ['✅', '❌', '⚠️', '❓', '❗', '💬', '🔄', '🆗', '🔍', '🔒', '📌', '📢', '🚫']
  }
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Adicionar reação">
        <IconButton 
          size="small" 
          onClick={handleClick} 
          sx={{ color: 'text.secondary' }}
        >
          <AddReactionIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 320, maxHeight: 300, overflow: 'auto' }}>
          {EMOJI_CATEGORIES.map((category) => (
            <Box key={category.name} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {category.name}
              </Typography>
              <Grid container spacing={1}>
                {category.emojis.map((emoji) => (
                  <Grid item key={emoji}>
                    <Box
                      sx={{
                        p: 0.5,
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        borderRadius: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'scale(1.2)',
                        },
                      }}
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

// Exportação nomeada para garantir compatibilidade
export { EmojiPicker };

// Exportação padrão também para flexibilidade
export default EmojiPicker;
