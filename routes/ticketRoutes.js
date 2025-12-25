const express = require('express');
const router = express.Router();
const SupportTicket = require('../model/SupportTicket');
const Notification = require('../model/Notification');
const auth = require('../middleware/authMiddleware');

const User = require('../model/User');

// @route   POST api/tickets
// @desc    Create a support ticket
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { orderId, subject, category, message } = req.body;
        
        const ticketData = {
            user: req.user.id,
            subject,
            category,
            message
        };

        // If orderId is a valid MongoDB ObjectId, save it as order reference
        if (orderId && orderId.match(/^[0-9a-fA-F]{24}$/)) {
            ticketData.order = orderId;
        }

        const newTicket = new SupportTicket(ticketData);
        const ticket = await newTicket.save();

        // Notify admins
        try {
            const admins = await User.find({ role: 'admin' });
            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'general',
                title: 'New Support Ticket',
                message: `A new ticket has been created: ${subject}`,
                link: '/admin/support'
            }));
            
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
                
                // Emit socket event for each admin if socketio is available
                const io = req.app.get('socketio');
                if (io) {
                    notifications.forEach(notif => {
                        io.emit('newNotification', { userId: notif.user, notification: notif });
                    });
                }
            }
        } catch (error) {
            console.error('Error creating admin notifications:', error);
            // Don't fail the ticket creation if notification fails
        }

        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/tickets/my
// @desc    Get current user tickets
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user.id })
            .populate('order', 'total status date')
            .sort({ date: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/tickets/admin
// @desc    Get all tickets (Admin)
// @access  Private
router.get('/admin', auth, async (req, res) => {
    try {
        const populatedTickets = await SupportTicket.find()
            .populate({
                path: 'user',
                select: 'name email role' 
            })
            .populate({
                path: 'order',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .sort({ date: -1 });
            
        res.json(populatedTickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tickets/:id/respond
// @desc    Admin response to ticket
// @access  Private
router.put('/:id/respond', auth, async (req, res) => {
    try {
        const { adminResponse, status, priority } = req.body;
        
        let ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

        ticket.adminResponse = adminResponse || ticket.adminResponse;
        ticket.status = status || 'Resolved';
        if (priority) ticket.priority = priority;

        await ticket.save();

        // Create notification for the user
        const newNotification = new Notification({
            user: ticket.user,
            type: 'ticket_response',
            title: 'New Ticket Response',
            message: `Admin has responded to your ticket: ${ticket.subject}`,
            link: '/support'
        });
        await newNotification.save();

        // Emit socket event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('newNotification', { userId: ticket.user, notification: newNotification });
        }

        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
