import { ALL_ROLES, APPROVAL_STATUS } from '../config/roles.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * Formats a raw stockUnit amount (e.g. 1500 "g") into a shopping-friendly
 * string — converting to the larger unit (kg/L) once it crosses 1000, and
 * pluralizing count-based units (piece/bunch/packet/box).
 */
function formatShoppingAmount(amount, stockUnit) {
  const round = (n) => Math.round(n * 100) / 100;

  if (stockUnit === 'g' || stockUnit === 'ml') {
    const bigUnit = stockUnit === 'g' ? 'kg' : 'L';
    if (amount >= 1000) {
      return `${round(amount / 1000)} ${bigUnit}`;
    }
    return `${round(amount)} ${stockUnit}`;
  }

  const label = amount === 1 ? stockUnit : `${stockUnit}s`;
  return `${round(amount)} ${label}`;
}

/**
 * Admin Controller
 * Handles admin dashboard analytics and management operations
 */
class AdminController {
  /**
   * Get dashboard overview statistics
   * @route GET /api/admin/dashboard
   * @access Private (Admin only)
   */
  async getDashboard(req, res) {
    try {
      const { period = '30' } = req.query; // days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Parallel execution for better performance
      const [
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        newUsersCount,
        revenueData,
        topProducts,
        recentOrders,
        lowStockProducts,
      ] = await Promise.all([
        // Total users
        User.countDocuments({ isActive: true }),
        
        // Total products
        Product.countDocuments({ isActive: true }),
        
        // Total categories
        Category.countDocuments({ isActive: true }),
        
        // Total orders
        Order.countDocuments(),
        
        // Pending orders
        Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } }),
        
        // Completed orders
        Order.countDocuments({ status: 'delivered' }),
        
        // Cancelled orders
        Order.countDocuments({ status: 'cancelled' }),
        
        // New users in period
        User.countDocuments({ 
          isActive: true,
          createdAt: { $gte: startDate }
        }),
        
        // Revenue data
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.total' },
              totalOrders: { $sum: 1 },
              averageOrderValue: { $avg: '$pricing.total' }
            }
          }
        ]),
        
        // Top selling products
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.subtotal' },
              name: { $first: '$items.name' }
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 }
        ]),
        
        // Recent orders
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderNumber user status pricing.total createdAt')
          .populate('user', 'firstName lastName email'),
        
        // Low stock products (stock <= 5)
        Product.find({ stock: { $lte: 5, }, isActive: true })
          .sort({ stock: 1 })
          .limit(5)
          .select('name stock slug')
      ]);

      // Calculate revenue metrics
      const revenue = revenueData[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
      };

      // Calculate growth rates (simplified)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));

      const previousRevenue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: previousPeriodStart, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.total' }
          }
        }
      ]);

      const prevRevenue = previousRevenue[0]?.total || 0;
      const revenueGrowth = prevRevenue > 0 
        ? ((revenue.totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(2)
        : 0;

      // Revenue by day for chart
      const revenueByDay = await Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Category performance
      const categoryStats = await Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            name: { $first: '$category.name' },
            revenue: { $sum: '$items.subtotal' },
            itemsSold: { $sum: '$items.quantity' }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalProducts,
            totalCategories,
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            newUsers: newUsersCount,
          },
          revenue: {
            total: revenue.totalRevenue,
            orders: revenue.totalOrders,
            averageOrderValue: revenue.averageOrderValue,
            growth: revenueGrowth,
            byDay: revenueByDay,
          },
          topProducts,
          recentOrders,
          lowStockProducts,
          categoryStats,
        },
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message,
      });
    }
  }

  /**
   * Get revenue analytics
   * @route GET /api/admin/analytics/revenue
   * @access Private (Admin only)
   */
  async getRevenueAnalytics(req, res) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      let dateFormat;
      switch (groupBy) {
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'week':
          dateFormat = '%Y-W%V';
          break;
        case 'day':
        default:
          dateFormat = '%Y-%m-%d';
      }

      const analytics = await Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$createdAt' }
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' },
            totalItems: { $sum: { $size: '$items' } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Calculate totals
      const totals = await Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$pricing.total' },
            totalTax: { $sum: '$pricing.tax' },
            totalShipping: { $sum: '$pricing.shippingFee' },
            totalDiscount: { $sum: '$pricing.discount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          analytics,
          summary: totals[0] || {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            totalTax: 0,
            totalShipping: 0,
            totalDiscount: 0
          }
        }
      });
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get customer analytics
   * @route GET /api/admin/analytics/customers
   * @access Private (Admin only)
   */
  async getCustomerAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const [
        topCustomers,
        customerGrowth,
        customersByRole,
        customerActivity
      ] = await Promise.all([
        // Top customers by revenue
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$user',
              totalSpent: { $sum: '$pricing.total' },
              totalOrders: { $sum: 1 }
            }
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              'user.firstName': 1,
              'user.lastName': 1,
              'user.email': 1,
              totalSpent: 1,
              totalOrders: 1
            }
          }
        ]),

        // Customer growth over time
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              newCustomers: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        // Customers by role
        User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]),

        // Customer activity stats
        User.aggregate([
          {
            $lookup: {
              from: 'orders',
              localField: '_id',
              foreignField: 'user',
              as: 'orders'
            }
          },
          {
            $project: {
              hasOrders: { $gt: [{ $size: '$orders' }, 0] }
            }
          },
          {
            $group: {
              _id: '$hasOrders',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      res.json({
        success: true,
        data: {
          topCustomers,
          customerGrowth,
          customersByRole,
          activeCustomers: customerActivity.find(a => a._id === true)?.count || 0,
          inactiveCustomers: customerActivity.find(a => a._id === false)?.count || 0,
        }
      });
    } catch (error) {
      console.error('Get customer analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get product analytics
   * @route GET /api/admin/analytics/products
   * @access Private (Admin only)
   */
  async getProductAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const [
        totalProducts,
        activeProducts,
        outOfStock,
        lowStock,
        featuredProducts,
        topSellingProducts,
        leastSellingProducts,
        productsByCategory
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ stock: 0, isActive: true }),
        Product.countDocuments({ stock: { $lt: 10, $gt: 0 }, isActive: true }),
        Product.countDocuments({ isFeatured: true, isActive: true }),

        // Top selling products
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.subtotal' }
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 10 }
        ]),

        // Least selling products
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.subtotal' }
            }
          },
          { $sort: { totalSold: 1 } },
          { $limit: 10 }
        ]),

        // Products by category
        Product.aggregate([
          {
            $match: { isActive: true }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: '$category' },
          {
            $group: {
              _id: '$category._id',
              name: { $first: '$category.name' },
              count: { $sum: 1 },
              totalStock: { $sum: '$stock' }
            }
          },
          { $sort: { count: -1 } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            total: totalProducts,
            active: activeProducts,
            outOfStock,
            lowStock,
            featured: featuredProducts
          },
          topSellingProducts,
          leastSellingProducts,
          productsByCategory
        }
      });
    } catch (error) {
      console.error('Get product analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get order analytics
   * @route GET /api/admin/analytics/orders
   * @access Private (Admin only)
   */
  async getOrderAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const [
        ordersByStatus,
        ordersByPaymentMethod,
        orderTrends,
        averageOrderMetrics
      ] = await Promise.all([
        // Orders by status
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalValue: { $sum: '$pricing.total' }
            }
          }
        ]),

        // Orders by payment method
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$payment.method',
              count: { $sum: 1 },
              totalValue: { $sum: '$pricing.total' }
            }
          }
        ]),

        // Order trends
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              orders: { $sum: 1 },
              revenue: { $sum: '$pricing.total' }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        // Average order metrics
        Order.aggregate([
          {
            $match: {
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              avgOrderValue: { $avg: '$pricing.total' },
              avgItemsPerOrder: { $avg: { $size: '$items' } },
              avgTax: { $avg: '$pricing.tax' },
              avgShipping: { $avg: '$pricing.shippingFee' },
              avgDiscount: { $avg: '$pricing.discount' }
            }
          }
        ])
      ]);

      res.json({
        success: true,
        data: {
          ordersByStatus,
          ordersByPaymentMethod,
          orderTrends,
          averageMetrics: averageOrderMetrics[0] || {
            avgOrderValue: 0,
            avgItemsPerOrder: 0,
            avgTax: 0,
            avgShipping: 0,
            avgDiscount: 0
          }
        }
      });
    } catch (error) {
      console.error('Get order analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order analytics',
        error: error.message,
      });
    }
  }

  /**
   * Shopping list for a delivery date: every variant of a product ordered
   * that day is converted to a real amount (using that variant's `quantity`
   * and the product's `stockUnit`) and summed into one total weight/volume/
   * count per product, so the admin knows e.g. "Tomatoes: 3.5 kg" instead of
   * separate, hard-to-add-up rows per variant.
   * @route GET /api/admin/orders/shopping-list?date=YYYY-MM-DD
   * @access Private (Admin only)
   */
  async getShoppingList(req, res) {
    try {
      const { date } = req.query;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'A valid date (YYYY-MM-DD) is required',
        });
      }

      // Orders are matched by re-deriving the same "YYYY-MM-DD" id their
      // deliveryDate was created from (see deliveryCapacity.js toDateId),
      // rather than a local start/end-of-day range, to avoid timezone drift.
      const dateMatch = {
        $expr: {
          $eq: [
            { $dateToString: { format: '%Y-%m-%d', date: '$deliveryDate' } },
            date,
          ],
        },
        status: { $nin: ['cancelled', 'refunded'] },
      };

      // Step 1: sum ordered units per product+variant (Mongo does the
      // heavy lifting of unwinding/summing across every order).
      const [variantRows, orderCount] = await Promise.all([
        Order.aggregate([
          { $match: dateMatch },
          { $unwind: '$items' },
          {
            // Skip line items the customer/admin already removed during an
            // availability resolution; use the fulfilled quantity when one
            // was set (e.g. partial-stock acceptance), else the ordered qty.
            $match: { 'items.resolution.action': { $ne: 'remove' } },
          },
          {
            $addFields: {
              effectiveQty: {
                $ifNull: ['$items.fulfilledQuantity', '$items.quantity'],
              },
            },
          },
          {
            $group: {
              _id: {
                product: '$items.product',
                name: '$items.name',
                variant: '$items.variant',
              },
              unitsOrdered: { $sum: '$effectiveQty' },
              orderCount: { $sum: 1 },
            },
          },
        ]),
        Order.countDocuments(dateMatch),
      ]);

      // Step 2: look up each referenced product's variants + stockUnit, to
      // turn "3 units of the 500g variant" into "1500 g".
      const productIds = [
        ...new Set(
          variantRows.map((r) => r._id.product?.toString()).filter(Boolean),
        ),
      ];
      const products = await Product.find(
        { _id: { $in: productIds } },
        'name stockUnit variants',
      ).lean();
      const productById = new Map(products.map((p) => [p._id.toString(), p]));

      // Step 3: merge every variant of the same product into one running
      // total (in the product's own stockUnit), then format it for display.
      const totalsByProduct = new Map();
      for (const row of variantRows) {
        const productId = row._id.product?.toString();
        const product = productId ? productById.get(productId) : null;
        const stockUnit = product?.stockUnit || 'piece';
        const variant = product?.variants?.find(
          (v) => v.label === row._id.variant,
        );
        // How much one ordered "unit" of this variant actually is, e.g. 500
        // for a "500g" variant — falls back to 1 if the variant/product
        // can't be found (e.g. deleted since the order was placed).
        const amountPerUnit = variant?.quantity ?? 1;

        const key = productId || row._id.name;
        const existing = totalsByProduct.get(key) || {
          name: row._id.name,
          stockUnit,
          totalAmount: 0,
          unitsOrdered: 0,
          orderCount: 0,
        };
        existing.totalAmount += amountPerUnit * row.unitsOrdered;
        existing.unitsOrdered += row.unitsOrdered;
        existing.orderCount += row.orderCount;
        totalsByProduct.set(key, existing);
      }

      const items = [...totalsByProduct.values()]
        .map((p) => ({
          name: p.name,
          unitsOrdered: p.unitsOrdered,
          orderCount: p.orderCount,
          totalAmount: p.totalAmount,
          stockUnit: p.stockUnit,
          displayWeight: formatShoppingAmount(p.totalAmount, p.stockUnit),
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      res.json({
        success: true,
        data: { date, orderCount, items },
      });
    } catch (error) {
      console.error('Get shopping list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shopping list',
        error: error.message,
      });
    }
  }

  /**
   * Get all users (Admin management)
   * @route GET /api/admin/users
   * @access Private (Admin only)
   */
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        isActive,
        approvalStatus,
        search,
        sort = '-createdAt'
      } = req.query;


      const query = {};

      if (role) query.role = role;
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  /**
   * Update user role/status
   * @route PUT /api/admin/users/:id
   * @access Private (Admin only)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, isActive, approvalStatus } = req.body;

      if (role && !ALL_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Allowed: ${ALL_ROLES.join(', ')}`,
        });
      }
      if (
        approvalStatus &&
        !Object.values(APPROVAL_STATUS).includes(approvalStatus)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid approval status',
        });
      }

      // An admin must not lock themselves out or demote themselves
      if (
        id === String(req.user._id) &&
        ((role && role !== req.user.role) ||
          isActive === false ||
          (approvalStatus && approvalStatus !== APPROVAL_STATUS.APPROVED))
      ) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role or status',
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (approvalStatus) user.approvalStatus = approvalStatus;

      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }

  /**
   * Delete user
   * @route DELETE /api/admin/users/:id
   * @access Private (Admin only)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }
}

export default new AdminController();
