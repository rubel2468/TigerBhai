import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";

export async function GET(request, { params }) {
    try {
        const { id: parentId } = params;

        await connectDB();

        const getSubCategories = await CategoryModel.find({ 
            deletedAt: null, 
            isMainCategory: false,
            parent: parentId
        }).select('_id name slug image parent').lean();

        return response(true, 200, 'Subcategories found.', getSubCategories);

    } catch (error) {
        return catchError(error);
    }
}
