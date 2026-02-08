import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { BrowserRouter } from 'react-router-dom';

describe('Play Button Navigation', () => {
    test('clicking the play button on homepage navigates to play page', () => {
        const { container } = render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        const playButton = screen.getByRole('button', { name: /play/i });
        fireEvent.click(playButton);

        expect(screen.getByText(/Opponent/i)).toBeInTheDocument();
    });

    test('play button is visible and clickable on homepage', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        const playButton = screen.getByRole('button', { name: /play/i });
        expect(playButton).toBeVisible();
        expect(playButton).not.toBeDisabled();
    });
});